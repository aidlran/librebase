import type { Injector } from '../modules/modules';
import { BinaryCodec, TextCodec, wrapCodec } from './codecs';
import { binaryPlugin, hashPlugin, jsonCodec } from './json';
import type { CodecMap } from './types';

export function codecMap(this: Injector): CodecMap {
  return {
    'application/lb-wrap': wrapCodec(this),
    'application/json': jsonCodec(hashPlugin, binaryPlugin),
    'application/octet-stream': BinaryCodec,
    'text/plain': TextCodec,
  };
}
