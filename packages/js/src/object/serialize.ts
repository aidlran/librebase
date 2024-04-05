import { format, parse, type MediaType } from 'content-type';
import { encodeWithCodec } from '../codec';
import { textEncoder } from '../shared';
import { checkMediaType } from './check';

export function serializeEncodedObject(
  payload: Uint8Array,
  mediaType: string | MediaType,
  trust = false,
): Uint8Array {
  const mediaTypeBytes = textEncoder.encode(
    typeof mediaType === 'string' ? mediaType : format(mediaType),
  );
  if (!trust) {
    checkMediaType(mediaTypeBytes);
  }
  return new Uint8Array([1, ...mediaTypeBytes, 0, ...payload]);
}

export function serializeObject(
  value: unknown,
  mediaType: string | MediaType,
  options?: { trust?: boolean; instanceID?: string },
): Uint8Array {
  const mediaTypeObj = typeof mediaType === 'string' ? parse(mediaType) : mediaType;
  const encodedPayload = encodeWithCodec(value, mediaTypeObj, options?.instanceID);
  return serializeEncodedObject(encodedPayload, mediaType, options?.trust);
}
