import { textDecoder, textEncoder } from '../shared';

export const BinaryCodec = {
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

export const TextCodec = {
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
