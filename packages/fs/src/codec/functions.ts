import { stringToBytes } from '@librebase/core';
import { Registry } from '@librebase/core/internal';
import { parse, type MediaType } from 'content-type';
import { validateSerializedFsContentMediaType } from '../validate';
import type { Codec } from './types';

export const CodecRegistry = new Registry<string, Codec>({
  validateKey: (key) => validateSerializedFsContentMediaType(stringToBytes(key)),
  validateValue: (value) =>
    typeof value.decode === 'function' && typeof value.encode === 'function',
});

export function decodeWithCodec<T>(
  payload: Uint8Array,
  mediaType: string | MediaType,
  instanceID?: string,
): Promise<T> {
  try {
    mediaType = typeof mediaType === 'string' ? parse(mediaType) : mediaType;
    const codec = CodecRegistry.getStrict(mediaType.type, instanceID) as Codec<T>;
    return Promise.resolve(codec.decode(payload, { instanceID, mediaType }));
  } catch (e) {
    return Promise.reject(e);
  }
}

export async function encodeWithCodec(
  input: unknown,
  mediaType: string | MediaType,
  instanceID?: string,
): Promise<Uint8Array> {
  try {
    mediaType = typeof mediaType === 'string' ? parse(mediaType) : mediaType;
    const codec = CodecRegistry.getStrict(mediaType.type, instanceID);
    return Promise.resolve(codec.encode(input, { instanceID, mediaType }));
  } catch (e) {
    return Promise.reject(e);
  }
}
