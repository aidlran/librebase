import type { MediaType } from 'content-type';
import type { Injector } from '../modules/modules';
import { textDecoder, textEncoder } from '../shared';
import type { WrapValue } from '../wrap/types';
import { getCodec } from './get';
import type { Codec } from './types';

export const BinaryCodec: Codec<Uint8Array> = {
  encode(data: Uint8Array) {
    if (!(data instanceof Uint8Array)) {
      throw new TypeError('Expected byte array');
    }
    return data;
  },
  decode(payload: Uint8Array) {
    return payload;
  },
};

export const TextCodec: Codec<string> = {
  encode(data: string) {
    if (typeof data !== 'string') {
      throw new TypeError('Expected string');
    }
    return textEncoder.encode(data);
  },
  decode(payload: Uint8Array) {
    return textDecoder.decode(payload);
  },
};

/** @deprecated @todo add as plugins to JSON and other structured data codecs */
export function wrapCodec(inject: Injector): Codec<WrapValue> {
  return {
    encode(data: WrapValue, mediaType: MediaType) {
      const encoding = mediaType.parameters?.enc ?? 'application/json';
      const serializer = inject(getCodec)(encoding);
      return serializer.encode(data, mediaType);
    },
    decode(payload: Uint8Array, mediaType: MediaType) {
      const encoding = mediaType.parameters?.enc ?? 'application/json';
      const serializer = inject(getCodec)(encoding);
      return serializer.decode(payload, mediaType) as WrapValue;
    },
  };
}
