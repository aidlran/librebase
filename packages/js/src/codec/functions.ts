import { parse, type MediaType } from 'content-type';
import { getModule } from '../modules/modules';
import { codecMap } from './codec-map';
import type { Codec } from './types';

export function decodeWithCodec(
  payload: Uint8Array,
  mediaType: string | MediaType,
  instanceID?: string,
) {
  const mediaTypeObj = typeof mediaType === 'string' ? parse(mediaType) : mediaType;
  const codec = getCodec(mediaType, instanceID);
  return codec.decode(payload, { instanceID, mediaType: mediaTypeObj });
}

export function encodeWithCodec(
  input: unknown,
  mediaType: string | MediaType,
  instanceID?: string,
) {
  const mediaTypeObj = typeof mediaType === 'string' ? parse(mediaType) : mediaType;
  const codec = getCodec(mediaTypeObj, instanceID);
  return codec.encode(input, { instanceID, mediaType: mediaTypeObj });
}

export function getCodec(mediaType: string | MediaType, instanceID?: string) {
  const mediaTypeString = (typeof mediaType === 'string' ? parse(mediaType) : mediaType).type;
  const codec = getModule(codecMap, instanceID)[mediaTypeString];
  if (!codec) {
    throw new TypeError('No codec available for ' + mediaTypeString);
  }
  return codec;
}

export function registerCodec(mediaType: string | MediaType, codec?: Codec, instanceID?: string) {
  const mediaTypeString = (typeof mediaType === 'string' ? parse(mediaType) : mediaType).type;
  getModule(codecMap, instanceID)[mediaTypeString] = codec;
}
