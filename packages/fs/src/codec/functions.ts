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

export interface RegisterCodecOptions {
  /** When specified, overrides the media type that the codec is registered as. */
  asMediaType?: string | MediaType | Array<string | MediaType>;
  /**
   * When set to true, if a codec is already registered with the target media type, that codec will
   * be replaced with the one being registered.
   */
  force?: boolean;
  instanceID?: string;
}

export function registerCodec(codec: Codec, options?: RegisterCodecOptions): void {
  const targetMediaType = options?.asMediaType ?? codec.mediaType;
  if (!targetMediaType) {
    throw new TypeError('ERROR_MEDIA_TYPE_MISSING');
  }
  if (typeof codec.decode !== 'function' || typeof codec.encode !== 'function') {
    throw new TypeError('ERROR_INVALID_CODEC');
  }
  const registered = getModule(codecMap, options?.instanceID);
  const toRegister = targetMediaType instanceof Array ? targetMediaType : [targetMediaType];
  for (const mediaType of toRegister) {
    const mediaTypeString = (typeof mediaType === 'string' ? parse(mediaType) : mediaType).type;
    if (!options?.force && registered[mediaTypeString]) {
      throw new TypeError('ERROR_MEDIA_TYPE_IN_USE');
    }
    registered[mediaTypeString] = codec;
  }
}
