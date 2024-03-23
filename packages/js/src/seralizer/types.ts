import type { MediaType } from 'content-type';

export interface Serializer<T = unknown> {
  serialize(data: T, mediaType: MediaType): Uint8Array;
  deserialize(payload: Uint8Array, mediaType: MediaType): T;
}

export type SerializerMap = Partial<Record<string, Serializer>>;
