import { decode, encode, encodingLength } from 'varint';
import { Registry, type RegistryModule } from '../internal/registry';

/**
 * This interface describes an identifier type and how the application should handle those
 * identifiers and associated values as they come into the engine and out through channels.
 *
 * @category Identifiers
 */
export interface IdentifierSchema<T = unknown> extends RegistryModule<number> {
  /**
   * Defines a function that takes a key/value pair, validates it, and then returns a parsed value.
   *
   * @param key The Identifier value as bytes. The type varint prefix is omitted.
   * @param value The value as bytes.
   * @param instanceID The ID of the instance where the function was called.
   * @returns The parsed value or, if performing some validation which fails, return `void`.
   */
  parse(
    key: ArrayLike<number> | ArrayBufferLike,
    value: ArrayLike<number> | ArrayBufferLike,
    instanceID?: string,
  ): T | void | Promise<T | void>;
}

/**
 * A {@linkcode Registry} for storing {@linkcode IdentifierSchema} instances and associating them with
 * a type integer.
 *
 * @category Identifiers
 */
export const IdentifierRegistry = new Registry<number, IdentifierSchema>({
  validateKey: (key) => Number.isInteger(key),
  validateModule: (value) => typeof value.parse === 'function',
});

/**
 * Parses an identifier.
 *
 * @category Identifiers
 * @param identifier An identifier as a byte array.
 * @returns A tuple consisting of the identifier's type integer and value as bytes.
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
 * @category Identifiers
 * @param type The identifier type integer.
 * @param value The identifier value as a byte array.
 * @returns The identifier as bytes.
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
