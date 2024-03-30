import { textDecoder, textEncoder } from '../shared';
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
