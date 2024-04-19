import { format, parse, type MediaType } from 'content-type';
import { encodeWithCodec } from '../codec';
import { textEncoder } from '../shared';
import { validateSerializedObjectMediaType } from './validate';

export function serializeEncodedObject(
  payload: Uint8Array,
  mediaType: string | MediaType,
  trust = false,
): Uint8Array {
  const mediaTypeBytes = textEncoder.encode(
    typeof mediaType === 'string' ? mediaType : format(mediaType),
  );
  if (!trust && !validateSerializedObjectMediaType(mediaTypeBytes)) {
    throw new Error('Bad media type');
  }
  return new Uint8Array([1, ...mediaTypeBytes, 0, ...payload]);
}

export async function serializeObject(
  value: unknown,
  mediaType: string | MediaType,
  options?: { trust?: boolean; instanceID?: string },
): Promise<Uint8Array> {
  const mediaTypeObj = typeof mediaType === 'string' ? parse(mediaType) : mediaType;
  const encodedPayload = await encodeWithCodec(value, mediaTypeObj, options?.instanceID);
  return serializeEncodedObject(encodedPayload, mediaType, options?.trust);
}
