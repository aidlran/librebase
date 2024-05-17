import { getByIdentifier, queryChannelsAsync } from '@librebase/core';
import type { MediaType } from 'content-type';
import { Hash, HashAlgorithm, hash } from './hash';
import { FsSchema } from './schema';
import { serializeFsContent } from './serialize';

export async function deleteFsContent(hash: ArrayBuffer | Hash, instanceID?: string) {
  const identifier = new Uint8Array([
    FsSchema.type,
    ...(hash instanceof Hash ? hash.toBytes() : new Uint8Array(hash)),
  ]);
  await queryChannelsAsync((channel) => channel.delete?.(identifier), instanceID);
}

export async function getFsContent(
  cid: ArrayLike<number> | ArrayBufferLike | Hash,
  instanceID?: string,
) {
  return getByIdentifier(
    [FsSchema.type, ...(cid instanceof Hash ? cid.toBytes() : new Uint8Array(cid))],
    instanceID,
  );
}

export interface PutOptions {
  hashAlg?: HashAlgorithm;
  instanceID?: string;
}

export async function putFsContent(
  value: unknown,
  mediaType: string | MediaType,
  options?: PutOptions,
): Promise<Hash> {
  const payload = await serializeFsContent(value, mediaType, { instanceID: options?.instanceID });
  const hashAlg = options?.hashAlg ?? HashAlgorithm.SHA256;
  const objectHash = await hash(hashAlg, payload);
  const identifier = new Uint8Array([FsSchema.type, ...objectHash.toBytes()]);
  await queryChannelsAsync((channel) => channel.put?.(identifier, payload), options?.instanceID);
  return objectHash;
}
