import type { Codec } from '../src/codec';

export const mockJSONCodec: Codec = {
  mediaType: 'application/json',
  decode(data) {
    return JSON.parse(new TextDecoder().decode(data));
  },
  encode(data) {
    return new TextEncoder().encode(JSON.stringify(data));
  },
};
