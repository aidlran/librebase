import base from 'base-x';

/**
 * Implements an encoder that converts values to and from base-x strings and `Uint8Array`.
 *
 * @category Encoding
 */
export interface BaseEncoder {
  /**
   * Decodes the encoded string to bytes.
   *
   * @param encoded The encoded string.
   * @returns The raw bytes.
   */
  decode(encoded: string): Uint8Array;
  /**
   * Encodes bytes into a string.
   *
   * @param input The bytes to encode.
   * @returns The encoded string.
   */
  encode(input: Uint8Array): string;
}

/**
 * A base58 (Bitcoin) encoder.
 *
 * @category Encoding
 */
export const Base58: BaseEncoder = base(
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
);

/**
 * A base64 encoder.
 *
 * @category Encoding
 */
export const Base64: BaseEncoder = {
  /**
   * Decodes the base64 encoded string to bytes.
   *
   * @param encoded The base64 encoded string.
   * @returns The raw bytes.
   */
  decode: (encoded: string) => stringToBytes(atob(encoded)),
  /**
   * Encodes bytes into a base64 string.
   *
   * @param input The bytes to encode.
   * @returns A base64 encoded string.
   */
  encode: (input: Uint8Array) => btoa(bytesToString(input)),
};

/**
 * Decode a a string to individual bytes by char code.
 *
 * @category Encoding
 * @param string A string.
 * @returns A `Uint8Array`.
 */
export function stringToBytes(string: string) {
  return new Uint8Array(Array.from(string, (_, k) => string.charCodeAt(k)));
}

/**
 * Encode individual bytes to string by char code.
 *
 * @category Encoding
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
 * @category Encoding
 * @param input An array of byte values, `ArrayBufferLike`, or base58 encoded string.
 * @returns A `Uint8Array`.
 */
export function identifierToBytes(input: ArrayLike<number> | ArrayBufferLike | string) {
  return typeof input === 'string' ? Base58.decode(input) : new Uint8Array(input);
}

/**
 * Coerces a payload-like value to a `Uint8Array`.
 *
 * @category Encoding
 * @param input An array of byte values, `ArrayBufferLike`, or base64 encoded string.
 * @returns A `Uint8Array`.
 */
export function payloadToBytes(input: ArrayLike<number> | ArrayBufferLike | string) {
  return typeof input === 'string' ? Base64.decode(input) : new Uint8Array(input);
}
