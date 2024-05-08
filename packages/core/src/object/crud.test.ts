import { afterAll, describe, expect, test } from 'vitest';
import { mockJSONCodec } from '../../testing/codecs';
import { getChannels, type ChannelDriver } from '../channel';
import { registerCodec } from '../codec';
import { FS } from '../fs';
import { Hash, HashAlgorithm } from '../hash';
import { registerIdentifier } from '../identifier';
import { getModule } from '../internal';
import { deleteObject, getObject, putObject } from './crud';

describe('Object CRUD', () => {
  const instanceID = 'object-crud';
  const mockDriverA: ChannelDriver = {};
  const mockDriverB: ChannelDriver = {};
  const channels = getChannels(instanceID);
  channels.push(mockDriverA, mockDriverB);
  registerCodec('application/json', mockJSONCodec, instanceID);
  registerIdentifier(FS, { instanceID });

  function createHash() {
    return crypto.getRandomValues(new Uint8Array(33));
  }

  afterAll(() => {
    channels.pop();
    channels.pop();
    registerCodec('application/json', undefined, instanceID);
  });

  describe('Delete object', () => {
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
          expect(hash).toEqual(baseHash.toBytes());
        }
        mockDriverA.deleteObject = deleteObjectMock;
        mockDriverB.deleteObject = deleteObjectMock;
        await expect(deleteObject(requestHash, instanceID)).resolves.toBeInstanceOf(Array);
        expect(calls).toBe(2);
      });
    }
  });

  test('Get object', async () => {
    const instanceID = 'test-get-object';

    const existing = crypto.getRandomValues(new Uint8Array(16));
    const existingCID = new Uint8Array([FS.type, ...existing]);

    getModule(getChannels, instanceID).push({
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
      await expect(getObject(cid, instanceID)).resolves.toEqual(existingCID);
    }

    const nonExistent = crypto.getRandomValues(new Uint8Array(16));
    for (const cid of [nonExistent, new Hash(nonExistent[0], nonExistent.subarray(1))]) {
      await expect(getObject(cid, instanceID)).resolves.toBeUndefined();
    }
  });

  test('Put object', async () => {
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
    await expect(putObject(value, mediaType, { instanceID })).resolves.toBeInstanceOf(Hash);
    expect(calls).toBe(2);
  });
});
