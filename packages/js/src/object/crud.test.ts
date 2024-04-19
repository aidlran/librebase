import { afterAll, describe, expect, test } from 'vitest';
import { getChannels, type ChannelDriver } from '../channel';
import { Hash, HashAlgorithm } from '../hash';
import { deleteObject, getObject, putObject } from './crud';

describe('Object CRUD', () => {
  const instanceID = 'object-crud';
  const mockDriverA: ChannelDriver = {};
  const mockDriverB: ChannelDriver = {};
  const channels = getChannels(instanceID);
  channels.push(mockDriverA, mockDriverB);

  function createHash() {
    return crypto.getRandomValues(new Uint8Array(33));
  }

  afterAll(() => {
    channels.pop();
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
    const existingRequestHash = createHash();
    const nonExistentRequestHash = createHash();
    let calls = 0;
    function getObjectMock(hash: ArrayBuffer) {
      calls++;
      expect(hash).oneOf([existingRequestHash, nonExistentRequestHash]);
      if (hash === existingRequestHash) {
        return hash;
      }
    }
    mockDriverA.getObject = getObjectMock;
    mockDriverB.getObject = getObjectMock;
    await expect(getObject(nonExistentRequestHash, instanceID)).resolves.toBeUndefined();
    await expect(getObject(existingRequestHash, instanceID)).resolves.toBe(existingRequestHash);
    expect(calls).toBe(2);
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
