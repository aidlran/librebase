import { getModule } from '@librebase/core/internal';
import { parse, type MediaType } from 'content-type';
import { codecMap } from './codec-map';
import type { Codec } from './types';

export function decodeWithCodec<T>(
  payload: Uint8Array,
  mediaType: string | MediaType,
  instanceID?: string,
): Promise<T> {
  try {
    const mediaTypeObj = typeof mediaType === 'string' ? parse(mediaType) : mediaType;
    const codec = getCodec<T>(mediaType, instanceID);
    return Promise.resolve(codec.decode(payload, { instanceID, mediaType: mediaTypeObj }));
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
    const mediaTypeObj = typeof mediaType === 'string' ? parse(mediaType) : mediaType;
    const codec = getCodec(mediaTypeObj, instanceID);
    return Promise.resolve(codec.encode(input, { instanceID, mediaType: mediaTypeObj }));
  } catch (e) {
    return Promise.reject(e);
  }
}

export function getCodec<T>(mediaType: string | MediaType, instanceID?: string): Codec<T> {
  const mediaTypeString = (typeof mediaType === 'string' ? parse(mediaType) : mediaType).type;
  const codec = getModule(codecMap, instanceID)[mediaTypeString] as Codec<T>;
  if (!codec) {
    throw new TypeError('No codec available for ' + mediaTypeString);
  }
  return codec;
}

export function registerCodec(
  mediaType: string | MediaType,
  codec?: Codec,
  instanceID?: string,
): void {
  const mediaTypeString = (typeof mediaType === 'string' ? parse(mediaType) : mediaType).type;
  getModule(codecMap, instanceID)[mediaTypeString] = codec;
}
