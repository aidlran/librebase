import { Hash } from '../hash';
import { base58, base64 } from './base-encode';

export function stringToBytes(string: string): Uint8Array {
  const { length } = string;
  return new Uint8Array(Array.from({ length }, (_, k) => string.charCodeAt(k)));
}

export function bytesToString(bytes: Uint8Array): string {
  let output = '';
  for (const byte of bytes) {
    output += String.fromCharCode(byte);
  }
  return output;
}

export function shred(buffer: Uint8Array) {
  for (const i in buffer) {
    buffer[i] = 0;
  }
}

function toBytes(
  this: { decode(input: string): Uint8Array },
  input: string | Hash | Uint8Array | ArrayBuffer,
): Uint8Array {
  if (typeof input === 'string') {
    return this.decode(input);
  } else if (input instanceof Uint8Array) {
    return input;
  } else if (input instanceof Hash) {
    return input.toBytes();
  } else {
    return new Uint8Array(input);
  }
}

/**
 * Coerces an identifier (address or hash) to a byte array.
 *
 * @param {string | Hash | Uint8Array | ArrayBuffer} address A buffer or base 58 encoded string.
 * @returns {Uint8Array}
 */
export const identifierToBytes = toBytes.bind(base58);

/**
 * Coerces a payload to a byte array.
 *
 * @param {string | Uint8Array | ArrayBuffer} address A buffer or base 64 encoded string.
 * @returns {Uint8Array}
 */
export const payloadToBytes = toBytes.bind(base64);
