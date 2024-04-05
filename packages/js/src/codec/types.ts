import type { MediaType } from 'content-type';

export interface Codec<T = unknown> {
  encode(data: T, mediaType: MediaType): Uint8Array;
  decode(payload: Uint8Array, mediaType: MediaType): T;
}
