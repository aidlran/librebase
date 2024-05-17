import { getChannels, registerIdentifier, type ChannelDriver } from '@librebase/core';
import { afterAll, describe, expect, test } from 'vitest';
import { registerCodec, type Codec } from './codec';
import { deleteFsContent, getFsContent, putFsContent } from './crud';
import { Hash, HashAlgorithm } from './hash';
import { FsSchema } from './schema';

describe('FS content CRUD', () => {
  const instanceID = 'fs-content-crud';
  const mockDriverA: ChannelDriver = {};
  const mockDriverB: ChannelDriver = {};
  const channels = getChannels(instanceID);

  const mockJSONCodec: Codec = {
    decode(data) {
      return JSON.parse(new TextDecoder().decode(data));
    },
    encode(data) {
      return new TextEncoder().encode(JSON.stringify(data));
    },
  };

  channels.push(mockDriverA, mockDriverB);
  registerCodec('application/json', mockJSONCodec, instanceID);
  registerIdentifier(FsSchema, { instanceID });

  function createHash() {
    return crypto.getRandomValues(new Uint8Array(33));
  }

  afterAll(() => {
    channels.pop();
    channels.pop();
    registerCodec('application/json', undefined, instanceID);
  });

  describe('Delete FS content', () => {
    const baseHash = new Hash(HashAlgorithm.SHA256, createHash());
    const testCases = [
      ['Uint8Array', baseHash.toBytes()],
      ['Hash', baseHash],
    ] as const;
    for (const [paramType, requestHash] of testCases) {
      test('With ' + paramType, async () => {
        let calls = 0;
        function deleteObjectMock(hash: ArrayBuffer) {
          calls++;
          expect(hash.slice(1)).toEqual(baseHash.toBytes());
        }
        mockDriverA.deleteObject = deleteObjectMock;
        mockDriverB.deleteObject = deleteObjectMock;
        await expect(deleteFsContent(requestHash, instanceID)).resolves.toBeUndefined();
        expect(calls).toBe(2);
      });
    }
  });

  test('Get FS content', async () => {
    const instanceID = 'test-get-fs-content';

    const existing = crypto.getRandomValues(new Uint8Array(16));
    const existingCID = new Uint8Array([FsSchema.type, ...existing]);

    getChannels(instanceID).push({
      getObject(identifier) {
        const buffer = new Uint8Array(identifier);
        if (buffer.length !== existingCID.length) {
          return;
        }
        for (let i = 0; i < buffer.length; i++) {
          if (buffer[i] !== existingCID[i]) {
            return;
          }
        }
        return identifier;
      },
    });

    registerIdentifier({ type: 0, parse: (_, v) => v }, { instanceID });

    for (const cid of [existing, new Hash(existing[0], existing.subarray(1))]) {
      await expect(getFsContent(cid, instanceID)).resolves.toEqual(existingCID);
    }

    const nonExistent = crypto.getRandomValues(new Uint8Array(16));
    for (const cid of [nonExistent, new Hash(nonExistent[0], nonExistent.subarray(1))]) {
      await expect(getFsContent(cid, instanceID)).resolves.toBeUndefined();
    }
  });

  test('Put FS content', async () => {
    const value = { test: 'test' };
    const mediaType = 'application/json';
    let calls = 0;
    function putObjectMock(hash: Uint8Array, object: Uint8Array) {
      calls++;
      expect(hash).toBeInstanceOf(Uint8Array);
      expect(object).toBeInstanceOf(Uint8Array);
    }
    mockDriverA.putObject = putObjectMock;
    mockDriverB.putObject = putObjectMock;
    await expect(putFsContent(value, mediaType, { instanceID })).resolves.toBeInstanceOf(Hash);
    expect(calls).toBe(2);
  });
});
