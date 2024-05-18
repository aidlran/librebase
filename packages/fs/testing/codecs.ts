import type { Codec } from '../src/codecs';

export const mockJSONCodec = {
  key: 'application/json',
  decode(data) {
    return JSON.parse(new TextDecoder().decode(data));
  },
  encode(data) {
    return new TextEncoder().encode(JSON.stringify(data));
  },
} satisfies Codec;
