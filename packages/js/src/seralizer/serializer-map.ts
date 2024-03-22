import { BinarySerializer, JsonSerializer, TextSerializer } from './serializers';
import type { SerializerMap } from './types';

/** Used internally as a symbol to get the protocol instance's `SerializerMap` via `getModule`. */
export function serializerMap(): SerializerMap {
  return {
    'application/json': JsonSerializer,
    'application/octet-stream': BinarySerializer,
    'text/plain': TextSerializer,
  };
}
