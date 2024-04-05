import type { MediaType } from 'content-type';
import { getChannels, queryChannelsAsync, queryChannelsSync } from '../channel';
import { Hash, HashAlgorithm, hash } from '../hash';
import { serializeObject } from './serialize';

export async function deleteObject(hash: ArrayBuffer | Hash, instanceID?: string) {
  const objectHash = hash instanceof Hash ? hash.toBytes() : hash;
  return queryChannelsAsync(getChannels(instanceID), (channel) => {
    if (channel.deleteObject) {
      return channel.deleteObject(objectHash);
    }
  });
}

export async function getObject(hash: ArrayBuffer | Hash, instanceID?: string) {
  const objectHash = hash instanceof Hash ? hash.toBytes() : hash;
  return queryChannelsSync(getChannels(instanceID), (channel) => {
    if (channel.getObject) {
      return channel.getObject(objectHash);
    }
  });
}

export interface PutOptions {
  hashAlg?: HashAlgorithm;
  instanceID?: string;
}

export async function putObject(
  value: unknown,
  mediaType: string | MediaType,
  options?: PutOptions,
): Promise<Hash> {
  const payload = serializeObject(value, mediaType, { instanceID: options?.instanceID });
  const hashAlg = options?.hashAlg ?? HashAlgorithm.SHA256;
  const objectHash = await hash(hashAlg, payload);
  await queryChannelsAsync(getChannels(options?.instanceID), (channel) => {
    if (channel.putObject) {
      return channel.putObject(objectHash.toBytes(), payload);
    }
  });
  return objectHash;
}
