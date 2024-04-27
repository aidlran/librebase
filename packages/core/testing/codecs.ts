import type { Codec } from '../src/codec';

export const mockJSONCodec: Codec = {
  decode(data) {
    return JSON.parse(new TextDecoder().decode(data));
  },
  encode(data) {
    return new TextEncoder().encode(JSON.stringify(data));
  },
};
