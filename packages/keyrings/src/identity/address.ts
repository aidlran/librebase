import { identifierToBytes, queryChannelsAsync, queryChannelsSync } from '@librebase/core';
import { Hash } from '@librebase/fs';

export const AddressType = {
  BIP32: 0,
} as const;

export async function getAddressHash(
  address: string | Uint8Array | ArrayBuffer,
  instanceID?: string,
): Promise<Hash | void> {
  const addressBin = identifierToBytes(address);
  const hash = await queryChannelsSync((channel) => {
    if (channel.getAddressHash) {
      return channel.getAddressHash(addressBin);
    }
  }, instanceID);
  if (hash) {
    const hashBin = new Uint8Array(hash);
    return new Hash(hashBin[0], hashBin.subarray(1));
  }
}

export async function setAddressHash(
  address: string | Uint8Array,
  hash: Hash | string | Uint8Array | ArrayBuffer,
  instanceID?: string,
) {
  const addressBin = identifierToBytes(address);
  const hashBin = hash instanceof Hash ? hash.toBytes() : identifierToBytes(hash);
  await queryChannelsAsync((channel) => {
    if (channel.setAddressHash) {
      return channel.setAddressHash(addressBin, hashBin);
    }
  }, instanceID);
}
