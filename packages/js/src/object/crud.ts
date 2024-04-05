import { getChannels, queryChannelsAsync, queryChannelsSync } from '../channel';
import { Hash, HashAlgorithm, hash } from '../hash';

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

export async function putObject(
  object: ArrayBuffer,
  hashAlg = HashAlgorithm.SHA256,
  instanceID?: string,
) {
  const objectHash = await hash(hashAlg, object);
  await queryChannelsAsync(getChannels(instanceID), (channel) => {
    if (channel.putObject) {
      return channel.putObject(objectHash.toBytes(), object);
    }
  });
}
