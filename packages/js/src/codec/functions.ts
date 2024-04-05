import { parse, type MediaType } from 'content-type';
import { getModule } from '../modules/modules';
import { codecMap } from './codec-map';
import type { Codec } from './types';

export function decodeWithCodec(payload: Uint8Array, mediaType: MediaType, instanceID?: string) {
  const codec = getCodec(mediaType, instanceID);
  return codec.decode(payload, mediaType);
}

export function encodeWithCodec(input: unknown, mediaType: MediaType, instanceID?: string) {
  const codec = getCodec(mediaType, instanceID);
  return codec.encode(input, mediaType);
}

export function getCodec(mediaType: MediaType, instanceID?: string) {
  const codec = getModule(codecMap, instanceID)[mediaType.type];
  if (!codec) {
    throw new TypeError('No codec available for ' + mediaType.type);
  }
  return codec;
}

export function registerCodec(mediaType: string | MediaType, codec?: Codec, instanceID?: string) {
  const codecs = getModule(codecMap, instanceID);
  const mediaTypeString = (typeof mediaType === 'string' ? parse(mediaType) : mediaType).type;
  codecs[mediaTypeString] = codec;
}
