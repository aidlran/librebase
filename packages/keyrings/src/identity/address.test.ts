import { getChannels, type ChannelDriver } from '@librebase/core';
import { Hash } from '@librebase/fs';
import { afterAll, describe, expect, test } from 'vitest';
import { getAddressHash, setAddressHash } from './address';

describe('Address CRUD', () => {
  const instanceID = 'address-crud';
  const mockDriverA: ChannelDriver = {};
  const mockDriverB: ChannelDriver = {};
  const channels = getChannels(instanceID);
  channels.push(mockDriverA, mockDriverB);

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
    function getAddressHashMock(address: ArrayBuffer) {
      calls++;
      expect(address).oneOf([existing, nonExistent]);
      if (address === existing) {
        return address;
      }
    }
    mockDriverA.getAddressHash = getAddressHashMock;
    mockDriverB.getAddressHash = getAddressHashMock;
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
    function setAddressHashMock(address: ArrayBuffer, hash: ArrayBuffer) {
      calls++;
      expect(address).toBe(inputAddress);
      expect(hash).toBe(inputHash);
    }
    mockDriverA.setAddressHash = setAddressHashMock;
    mockDriverB.setAddressHash = setAddressHashMock;
    await expect(setAddressHash(inputAddress, inputHash, instanceID)).resolves.toBeUndefined();
    expect(calls).toBe(2);
  });
});
