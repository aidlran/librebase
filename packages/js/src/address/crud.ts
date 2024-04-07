import { base58 } from '../buffer';
import { getChannels, queryChannelsAsync, queryChannelsSync } from '../channel';
import { Hash } from '../hash';
import { addressToBytes } from './address-to-bytes';

export async function getAddressHash(
  address: string | Uint8Array,
  instanceID?: string,
): Promise<Hash | void> {
  const addressBin = addressToBytes(address);
  const hash = await queryChannelsSync(getChannels(instanceID), (channel) => {
    if (channel.getAddressHash) {
      return channel.getAddressHash(addressBin);
    }
  });
  if (hash) {
    const hashBin = new Uint8Array(hash);
    return new Hash(hashBin[0], hashBin.subarray(1));
  }
}

export async function setAddressHash(
  address: string | Uint8Array,
  hash: Hash | string | Uint8Array,
  instanceID?: string,
) {
  const addressBin = addressToBytes(address);
  const hashBin =
    typeof hash === 'string' ? base58.decode(hash) : hash instanceof Hash ? hash.toBytes() : hash;
  await queryChannelsAsync(getChannels(instanceID), (channel) => {
    if (channel.setAddressHash) {
      return channel.setAddressHash(addressBin, hashBin);
    }
  });
}
