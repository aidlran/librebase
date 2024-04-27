import type { Injector } from '../modules/modules';
import { BinaryCodec, TextCodec } from './codecs';
import type { Codec } from './types';

export type CodecMap = Partial<Record<string, Codec>>;

export function codecMap(this: Injector): CodecMap {
  return {
    'application/octet-stream': BinaryCodec,
    'text/plain': TextCodec,
  };
}
