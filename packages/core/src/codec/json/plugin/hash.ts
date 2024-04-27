import { base58 } from '../../../buffer';
import { Hash } from '../../../hash';

/** JSON codec plugin for storing Hash instances as base58 strings. */
export const hashPlugin = {
  replacer(_: unknown, value: unknown) {
    return value instanceof Hash ? `#:b58:${value.toBase58()}` : value;
  },
  reviver(_: unknown, value: unknown) {
    if (typeof value === 'string' && value.length > 6 && value.startsWith('#:b58:')) {
      const hash = base58.decode(value.slice(6));
      return new Hash(hash[0], hash.subarray(1));
    }
    return value;
  },
};
