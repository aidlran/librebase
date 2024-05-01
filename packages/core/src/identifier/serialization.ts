import { decode, encode, encodingLength } from 'varint';

/**
 * Parses an identifier buffer.
 *
 * @param identifier An identifier buffer.
 * @returns A tuple consisting of the identifier's type integer and value.
 */
export function parseIdentifier(
  identifier: ArrayLike<number> | ArrayBufferLike,
): [type: number, value: Uint8Array] {
  const view = new Uint8Array(identifier);
  const type = decode(view);
  const payload = view.subarray(encodingLength(type));
  return [type, payload];
}

/**
 * Encodes an identifier buffer.
 *
 * @param type The identifier type integer.
 * @param value The identifier value.
 * @returns An identifier buffer.
 */
export function encodeIdentifier(type: number, value: ArrayLike<number> | ArrayBufferLike) {
  const typeBuf = encode(type);
  const valueBuf = new Uint8Array(value);
  const output = new Uint8Array(typeBuf.length + valueBuf.length);
  let i: number;
  for (i = 0; i < typeBuf.length; i++) {
    output[i] = typeBuf[i];
  }
  for (let j = 0; j < valueBuf.length; i++, j++) {
    output[i] = valueBuf[j];
  }
  return output;
}
