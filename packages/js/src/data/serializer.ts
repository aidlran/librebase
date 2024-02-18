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

type JsonValue = number | string | boolean | null | JsonValue[] | { [key: string]: JsonValue };
interface JsonSerializer extends Serializer<JsonValue> {
  deserialize: <T extends JsonValue>(payload: Uint8Array) => T;
}

export const JsonSerializer: JsonSerializer = {
  serialize(data) {
    return textEncoder.encode(JSON.stringify(data));
  },
  deserialize<T extends JsonValue>(payload: Uint8Array): T {
    return JSON.parse(textDecoder.decode(payload)) as T;
  },
};
