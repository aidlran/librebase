import { Hash } from '../immutable/hashes.js';
import { Base58, Base64 } from '../internal/encoding.js';
import type { JsonCodecMiddleware } from './types.js';

/** A middleware to swap binary streams for base encoded strings. */
export interface BinaryMiddleware extends JsonCodecMiddleware {
  /** Detects and replaces byte arrays and hash instances with encoded strings. */
  replacer(key: unknown, value: unknown): unknown;
  /** Detects and replaces encoded strings with byte arrays. */
  reviver(key: unknown, value: unknown): unknown;
}

/** A middleware to swap binary streams for base encoded strings. */
export const binary: BinaryMiddleware = {
  replacer(_: unknown, value: unknown) {
    if (value instanceof Hash) {
      return '$bin:b58:' + value.toBase58();
    }
    if (value instanceof Uint8Array) {
      return '$bin:b64:' + Base64.encode(value);
    }
    if (value instanceof ArrayBuffer) {
      return '$bin:b64:' + Base64.encode(new Uint8Array(value));
    }
    return value;
  },
  reviver(_: unknown, value: unknown) {
    if (typeof value === 'string' && value.length >= 9) {
      if (value.startsWith('$bin:b58:')) {
        return Base58.decode(value.slice(9));
      }
      if (value.startsWith('$bin:b64:')) {
        return Base64.decode(value.slice(9));
      }
    }
    return value;
  },
};
