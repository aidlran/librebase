import { parse, type MediaType } from 'content-type';
import { getModule } from '../modules/modules';
import { codecMap } from './codec-map';
import type { Codec } from './types';

function getCodec<T>(mediaType: string | MediaType, instanceID?: string): Codec<T> {
  const mediaTypeString = (typeof mediaType === 'string' ? parse(mediaType) : mediaType).type;
  const codec = getModule(codecMap, instanceID)[mediaTypeString] as Codec<T>;
  if (!codec) {
    throw new TypeError('No codec available for ' + mediaTypeString);
  }
  return codec;
}

/** @deprecated Use `@librebase/fs` */
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

/** @deprecated Use `@librebase/fs` */
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
