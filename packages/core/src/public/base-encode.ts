import base from 'base-x';
import { bytesToString, stringToBytes } from './buffer-utils';

/**
 * Implements an encoder that converts values to and from base-x strings and `Uint8Array`.
 *
 * @category Base-X Encoding
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
 * @category Base-X Encoding
 */
export const Base58: BaseEncoder = base(
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
);

/**
 * A base64 encoder.
 *
 * @category Base-X Encoding
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
