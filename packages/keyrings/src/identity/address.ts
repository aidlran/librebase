import { encodeIdentifier, getOne, putOne } from '@librebase/core';
import { identifierToBytes } from '@librebase/core/internal';
import { Hash } from '@librebase/fs';

export const AddressType = {
  BIP32: 0,
} as const;

export async function getAddressHash(
  address: string | Uint8Array | ArrayBuffer,
  instanceID?: string,
): Promise<Hash | void> {
  address = identifierToBytes(address);
  const id = encodeIdentifier(2, address);
  const cid = await getOne<ArrayBuffer>(id, instanceID);
  if (cid) {
    const hashBin = new Uint8Array(cid);
    return new Hash(hashBin[0], hashBin.subarray(1));
  }
}

export async function setAddressHash(
  address: string | Uint8Array,
  hash: Hash | string | Uint8Array | ArrayBuffer,
  instanceID?: string,
) {
  address = identifierToBytes(address);
  const id = encodeIdentifier(2, address);
  const hashBin = hash instanceof Hash ? hash.toBytes() : identifierToBytes(hash);
  return putOne(id, hashBin, instanceID);
}
