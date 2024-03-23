import { textDecoder, textEncoder } from '../shared';

export const TextSerializer = {
  serialize(data: string) {
    return textEncoder.encode(data);
  },
  deserialize(payload: Uint8Array) {
    return textDecoder.decode(payload);
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
