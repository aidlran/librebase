import { deleteOne, encodeIdentifier, getOne, putOne } from '@librebase/core';
import type { MediaType } from 'content-type';
import { Hash, HashAlgorithm, hash } from './hash';
import { FsSchema } from './schema';
import { serializeFsContent } from './serialize';

export async function deleteFsContent(cid: ArrayBuffer | Hash, instanceID?: string) {
  cid = cid instanceof Hash ? cid.toBytes() : new Uint8Array(cid);
  const id = encodeIdentifier(FsSchema.type, cid);
  return deleteOne(id, instanceID);
}

export async function getFsContent(
  cid: ArrayLike<number> | ArrayBufferLike | Hash,
  instanceID?: string,
) {
  cid = cid instanceof Hash ? cid.toBytes() : new Uint8Array(cid);
  const id = encodeIdentifier(FsSchema.type, cid);
  return getOne(id, instanceID);
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
  const id = encodeIdentifier(FsSchema.type, objectHash.toBytes());
  await putOne(id, payload, options?.instanceID);
  return objectHash;
}
