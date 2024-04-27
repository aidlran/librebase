import { Hash, base58, base64 } from '@librebase/core';

/** JSON codec middleware to swap binary streams for base encoded strings. */
export const binary = {
  replacer(_: unknown, value: unknown) {
    if (value instanceof Hash) {
      return '$bin:b58:' + value.toBase58();
    }
    if (value instanceof Uint8Array) {
      return '$bin:b64:' + base64.encode(value);
    }
    if (value instanceof ArrayBuffer) {
      return '$bin:b64:' + base64.encode(new Uint8Array(value));
    }
    return value;
  },
  reviver(_: unknown, value: unknown) {
    if (typeof value === 'string' && value.length >= 9) {
      if (value.startsWith('$bin:b58:')) {
        return base58.decode(value.slice(9));
      }
      if (value.startsWith('$bin:b64:')) {
        return base64.decode(value.slice(9));
      }
    }
    return value;
  },
};
