import { textDecoder, textEncoder } from '../shared';

export interface Serializer<T> {
  serialize(data: T): Uint8Array;
  deserialize(payload: Uint8Array): T;
}

export const TextSerializer: Serializer<string> = {
  serialize(data) {
    return textEncoder.encode(data);
  },
  deserialize(payload) {
    return textDecoder.decode(payload);
  },
};

export const JsonSerializer: Serializer<any> = {
  serialize(data) {
    return textEncoder.encode(JSON.stringify(data));
  },
  deserialize(payload) {
    return JSON.parse(textDecoder.decode(payload));
  },
};
