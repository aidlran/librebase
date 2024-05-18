import { Registry, type RegistryValue } from '../registry';

/** Describes an identifier. */
export interface IdentifierSchema<T = unknown> extends RegistryValue<number> {
  parse(
    key: ArrayLike<number> | ArrayBufferLike,
    value: ArrayLike<number> | ArrayBufferLike,
    instanceID?: string,
  ): T | void | Promise<T | void>;
}

export const IdentifierRegistry = new Registry<number, IdentifierSchema>({
  validateKey: (key) => Number.isInteger(key),
  validateValue: (value) => typeof value.parse === 'function',
});
