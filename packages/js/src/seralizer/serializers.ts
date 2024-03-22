import { textDecoder, textEncoder } from '../shared';

export const BinarySerializer = {
  serialize(data: Uint8Array) {
    if (!(data instanceof Uint8Array)) {
      throw new TypeError('Expected byte array');
    }
    return data;
  },
  deserialize(payload: Uint8Array) {
    return payload;
  },
};

export const JsonSerializer = {
  serialize(data: unknown) {
    return textEncoder.encode(JSON.stringify(data));
  },
  deserialize<T>(payload: Uint8Array): T {
    return JSON.parse(textDecoder.decode(payload)) as T;
  },
};

export const TextSerializer = {
  serialize(data: string) {
    if (typeof data !== 'string') {
      throw new TypeError('Expected string');
    }
    return textEncoder.encode(data);
  },
  deserialize(payload: Uint8Array) {
    return textDecoder.decode(payload);
  },
};
