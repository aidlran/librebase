import type { MediaType } from 'content-type';
import { get, put, remove } from '../channel/crud';
import { Hash, HashAlgorithm, hash } from '../hash';
import { serializeObject } from './serialize';

export async function deleteObject(hash: ArrayBuffer | Hash, instanceID?: string) {
  return remove(hash instanceof Hash ? hash.toBytes() : hash, instanceID);
}

export async function getObject(hash: ArrayBuffer | Hash, instanceID?: string) {
  return get(hash instanceof Hash ? hash.toBytes() : hash, instanceID);
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
  const payload = await serializeObject(value, mediaType, { instanceID: options?.instanceID });
  const hashAlg = options?.hashAlg ?? HashAlgorithm.SHA256;
  const objectHash = await hash(hashAlg, payload);
  await put(objectHash.toBytes(), payload, options?.instanceID);
  return objectHash;
}
