import { format, type MediaType } from 'content-type';
import { Identifier, deleteOne, getOne, putOne } from '../public/index.js';
import { cidToBytes, type CIDLike } from './cid.js';
import { encodeWithCodec } from './codecs.js';
import { Hash, HashAlgorithm, hash } from './hashes.js';
import { validateMediaType } from './media-types.js';
import { FS } from './schema.js';

export async function deleteFile(cid: CIDLike, instanceID?: string) {
  return deleteOne(new Identifier(FS.key, cidToBytes(cid)), instanceID);
}

export async function getFile<T = unknown>(cid: CIDLike, instanceID?: string) {
  return getOne<T>(new Identifier(FS.key, cidToBytes(cid)), instanceID);
}

export interface PutOptions {
  hashAlg?: HashAlgorithm;
  instanceID?: string;
}

export async function putFile(
  value: unknown,
  mediaType: string | MediaType,
  options?: PutOptions,
): Promise<Hash> {
  const payload = await serializeFileContent(value, mediaType, { instanceID: options?.instanceID });
  const hashAlg = options?.hashAlg ?? HashAlgorithm.SHA256;
  const objectHash = await hash(hashAlg, payload);
  const id = new Identifier(FS.key, objectHash.toBytes());
  await putOne(id, payload, options?.instanceID);
  return objectHash;
}

export type ParsedFileContent = [version: number, mediaType: string, payload: Uint8Array];

export function parseFileContent(content: Uint8Array, trust = false): ParsedFileContent {
  const nulIndex = content.indexOf(0, 4);

  if (nulIndex === -1) {
    throw new TypeError('No NUL byte');
  }

  const version = content[0];
  const mediaTypeBytes = content.subarray(1, nulIndex);

  if (!trust) {
    if (!fileVersionIsSupported(version)) {
      throw new TypeError('Unsupported FS version: ' + version);
    }
    if (!validateMediaType(mediaTypeBytes)) {
      throw new TypeError('Bad media type');
    }
  }

  return [version, new TextDecoder().decode(mediaTypeBytes), content.subarray(nulIndex + 1)];
}

export interface SerializeFsContentOptions {
  /**
   * Set to true to use a encoded payload. When this option is enabled, the value must be a
   * `Uint8Array`.
   *
   * @default false
   */
  encoded?: boolean;
  instanceID?: string;
  /**
   * Set to true to trust the parameter values and skip any validation.
   *
   * @default false
   */
  trust?: boolean;
}

export async function serializeFileContent(
  value: unknown,
  mediaType: string | MediaType,
  options?: SerializeFsContentOptions & { encoded?: false },
): Promise<Uint8Array>;
export async function serializeFileContent(
  payload: Uint8Array,
  mediaType: string | MediaType,
  options: SerializeFsContentOptions & { encoded: true },
): Promise<Uint8Array>;
export async function serializeFileContent(
  value: unknown,
  mediaType: string | MediaType,
  options?: SerializeFsContentOptions,
): Promise<Uint8Array> {
  let encodedPayload: Uint8Array;

  if (options?.encoded) {
    if (!(value instanceof Uint8Array)) {
      throw new TypeError('Expected Uint8Array');
    }
    encodedPayload = value;
  } else {
    encodedPayload = await encodeWithCodec(value, mediaType, options?.instanceID);
  }

  const mediaTypeBytes = new TextEncoder().encode(
    typeof mediaType === 'string' ? mediaType : format(mediaType),
  );

  if (!options?.trust && !validateMediaType(mediaTypeBytes)) {
    throw new Error('Bad media type');
  }

  return new Uint8Array([1, ...mediaTypeBytes, 0, ...encodedPayload]);
}

export function fileVersionIsSupported(version: number): boolean {
  return version === 1;
}
