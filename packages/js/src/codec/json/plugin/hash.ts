import { base58 } from '../../../crypto/encode/base';
import { Hash } from '../../../hash';
import type { JsonCodecPlugin } from '../types';

/** JSON codec plugin for storing Hash instances as base58 strings. */
export const hashPlugin: JsonCodecPlugin = {
  replacer(_, value) {
    return value instanceof Hash ? { '#': value.toBase58() } : value;
  },
  reviver(_, v) {
    const value = v as { '#': string };
    if (
      value !== null &&
      typeof value === 'object' &&
      Object.keys(value).length == 1 &&
      typeof value['#'] === 'string'
    ) {
      const hash = base58.decode(value['#']);
      return new Hash(hash[0], hash.subarray(1));
    }
    return value;
  },
};
