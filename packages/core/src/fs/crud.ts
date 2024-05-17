import type { MediaType } from 'content-type';
import { queryChannelsAsync } from '../channel';
import { FsSchema } from '../fs';
import { Hash, HashAlgorithm, hash } from '../hash';
import { serializeFsContent } from './serialize';

/** @deprecated Use `@librebase/fs` */
export interface PutOptions {
  hashAlg?: HashAlgorithm;
  instanceID?: string;
}

/** @deprecated Use `@librebase/fs` */
export async function putFsContent(
  value: unknown,
  mediaType: string | MediaType,
  options?: PutOptions,
): Promise<Hash> {
  const payload = await serializeFsContent(value, mediaType, { instanceID: options?.instanceID });
  const hashAlg = options?.hashAlg ?? HashAlgorithm.SHA256;
  const objectHash = await hash(hashAlg, payload);
  const identifier = new Uint8Array([FsSchema.type, ...objectHash.toBytes()]);
  await queryChannelsAsync(
    (channel) => channel.putObject?.(identifier, payload),
    options?.instanceID,
  );
  return objectHash;
}
