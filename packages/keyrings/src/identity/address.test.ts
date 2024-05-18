import { getChannels, registerIdentifier, type ChannelDriver } from '@librebase/core';
import { Hash } from '@librebase/fs';
import { afterAll, describe, expect, test } from 'vitest';
import { getAddressHash, setAddressHash } from './address';

describe('Address CRUD', () => {
  const instanceID = 'address-crud';
  const mockDriverA: ChannelDriver = {};
  const mockDriverB: ChannelDriver = {};
  const channels = getChannels(instanceID);
  channels.push(mockDriverA, mockDriverB);

  registerIdentifier({ type: 2, parse: (_, v) => v }, { instanceID });

  function createBytes() {
    return crypto.getRandomValues(new Uint8Array(33));
  }

  afterAll(() => {
    channels.pop();
    channels.pop();
  });

  test('Get address hash', async () => {
    const existing = createBytes();
    const nonExistent = createBytes();
    let calls = 0;
    function getMock(id: ArrayBuffer) {
      calls++;
      const address = new Uint8Array(id).subarray(1);
      for (const i in address) {
        if (address[i] !== existing[i]) {
          return;
        }
      }
      return existing;
    }
    mockDriverA.get = getMock;
    mockDriverB.get = getMock;
    await expect(getAddressHash(nonExistent, instanceID)).resolves.toBeUndefined();
    // +2 calls as neither return
    const existingRequest = await getAddressHash(existing, instanceID);
    // +1 call as returns after first
    expect(existingRequest).toBeInstanceOf(Hash);
    expect(existingRequest!.toBytes()).toEqual(existing);
    expect(calls).toBe(3);
  });

  test('Set address hash', async () => {
    const inputAddress = createBytes();
    const inputHash = createBytes();
    let calls = 0;
    function putMock(address: ArrayBuffer, hash: ArrayBuffer) {
      calls++;
      expect(new Uint8Array(address).subarray(1)).toEqual(inputAddress);
      expect(hash).toEqual(inputHash);
    }
    mockDriverA.put = putMock;
    mockDriverB.put = putMock;
    await expect(setAddressHash(inputAddress, inputHash, instanceID)).resolves.toBeUndefined();
    expect(calls).toBe(2);
  });
});
