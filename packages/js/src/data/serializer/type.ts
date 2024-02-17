export interface Serializer {
  serialize(data: unknown): Uint8Array;
  deserialize(payload: Uint8Array): unknown;
}
