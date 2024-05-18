import { Base58, Base64 } from './base-encode';

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

/**
 * Coerces an identifier (address or hash) to a byte array.
 *
 * @param address A buffer or base 58 encoded string.
 * @returns {Uint8Array}
 */
export function identifierToBytes(input: string | Uint8Array | ArrayBuffer): Uint8Array {
  if (typeof input === 'string') {
    return Base58.decode(input);
  } else if (input instanceof Uint8Array) {
    return input;
  } else {
    return new Uint8Array(input);
  }
}

/**
 * Coerces a payload to a byte array.
 *
 * @param address A buffer or base 64 encoded string.
 * @returns {Uint8Array}
 */
export function payloadToBytes(input: string | Uint8Array | ArrayBuffer): Uint8Array {
  if (typeof input === 'string') {
    return Base64.decode(input);
  } else if (input instanceof Uint8Array) {
    return input;
  } else {
    return new Uint8Array(input);
  }
}
