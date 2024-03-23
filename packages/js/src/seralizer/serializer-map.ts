import type { Injector } from '../modules/modules';
import { BinarySerializer, JsonSerializer, TextSerializer, wrapSerializer } from './serializers';
import type { SerializerMap } from './types';

/** Used internally as a symbol to get the protocol instance's `SerializerMap` via `getModule`. */
export function serializerMap(this: Injector): SerializerMap {
  return {
    'application/lb-wrap': wrapSerializer(this),
    'application/json': JsonSerializer,
    'application/octet-stream': BinarySerializer,
    'text/plain': TextSerializer,
  };
}
