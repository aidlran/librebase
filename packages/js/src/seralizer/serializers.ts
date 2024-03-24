import type { MediaType } from 'content-type';
import type { WrapValue } from '../data/types';
import type { Injector } from '../modules/modules';
import { textDecoder, textEncoder } from '../shared';
import { getSerializer } from './get';

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
    return textEncoder.encode(
      JSON.stringify(data, (_, value) => {
        if (value instanceof Uint8Array) {
          return ['b', Array.from(value)];
        } else return value as unknown;
      }),
    );
  },
  deserialize<T>(payload: Uint8Array): T {
    return JSON.parse(textDecoder.decode(payload), (_, value) => {
      if (
        Array.isArray(value) &&
        value.length === 2 &&
        value[0] === 'b' &&
        Array.isArray(value[1])
      ) {
        return new Uint8Array(value[1]);
      } else return value as unknown;
    }) as T;
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

export function wrapSerializer(inject: Injector) {
  return {
    serialize(data: WrapValue, mediaType: MediaType) {
      const encoding = mediaType.parameters?.enc ?? 'application/json';
      const serializer = inject(getSerializer)(encoding);
      return serializer.serialize(data, mediaType);
    },
    deserialize(payload: Uint8Array, mediaType: MediaType) {
      const encoding = mediaType.parameters?.enc ?? 'application/json';
      const serializer = inject(getSerializer)(encoding);
      return serializer.deserialize(payload, mediaType) as WrapValue;
    },
  };
}
