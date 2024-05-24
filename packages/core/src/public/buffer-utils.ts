import { Base58, Base64 } from './base-encode';

/**
 * Decode a a string to individual bytes by char code.
 *
 * @category Buffer Utilities
 * @param string A string.
 * @returns A `Uint8Array`.
 */
export function stringToBytes(string: string) {
  return new Uint8Array(Array.from(string, (_, k) => string.charCodeAt(k)));
}

/**
 * Encode individual bytes to string by char code.
 *
 * @category Buffer Utilities
 * @param bytes An array of byte values or `ArrayBufferLike`.
 * @returns A string.
 */
export function bytesToString(bytes: ArrayLike<number> | ArrayBufferLike) {
  let output = '';
  for (const byte of new Uint8Array(bytes)) {
    output += String.fromCharCode(byte);
  }
  return output;
}

/**
 * Coerces an identifier-like value to a `Uint8Array`.
 *
 * @category Buffer Utilities
 * @param input An array of byte values, `ArrayBufferLike`, or base58 encoded string.
 * @returns A `Uint8Array`.
 */
export function identifierToBytes(input: ArrayLike<number> | ArrayBufferLike | string) {
  return typeof input === 'string' ? Base58.decode(input) : new Uint8Array(input);
}

/**
 * Coerces a payload-like value to a `Uint8Array`.
 *
 * @category Buffer Utilities
 * @param input An array of byte values, `ArrayBufferLike`, or base64 encoded string.
 * @returns A `Uint8Array`.
 */
export function payloadToBytes(input: ArrayLike<number> | ArrayBufferLike | string) {
  return typeof input === 'string' ? Base64.decode(input) : new Uint8Array(input);
}
