import { textDecoder, textEncoder } from '../../shared';
import type { Serializer } from './type';

export const JsonSerializer: Serializer = {
  serialize(data) {
    return textEncoder.encode(JSON.stringify(data));
  },
  deserialize(payload) {
    return JSON.parse(textDecoder.decode(payload)) as never;
  },
};
