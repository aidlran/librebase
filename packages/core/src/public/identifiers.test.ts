import { describe, expect, test } from 'vitest';
import { Base58, RegistryError } from '../internal';
import { Identifier, IdentifierRegistry, type IdentifierSchema } from './identifiers';

describe('Identifier Registry', () => {
  const instanceID = 'Identifier Registry';
  const parse: IdentifierSchema['parse'] = (_, v) => v;

  test('Key validation', () => {
    for (const key of [0, 2]) {
      expect(IdentifierRegistry.register({ key, parse }, { instanceID })).toBeUndefined();
    }
    for (const key of [2.1, '2.1', '2'] as never[]) {
      expect(() => IdentifierRegistry.register({ key, parse }, { instanceID })).toThrow(
        RegistryError,
      );
    }
  });

  test('Value validation', () => {
    expect(IdentifierRegistry.register({ key: 3, parse })).toBeUndefined();
    expect(() => IdentifierRegistry.register({ key: 4 } as never)).toThrow(RegistryError);
    expect(() => IdentifierRegistry.register({ key: 4, parse: '' } as never)).toThrow(
      RegistryError,
    );
  });
});

test('Identifier class', () => {
  for (const { bytes, type, value, b58 } of [
    {
      bytes: [1, 2, 3, 4],
      type: 1,
      value: [2, 3, 4],
      b58: '2VfUX',
    },
    {
      bytes: [232, 7, 2, 3, 4],
      type: 1000,
      value: [2, 3, 4],
      b58: 'TBJiAGb',
    },
  ]) {
    for (const id of [new Identifier(type, value), new Identifier(bytes), new Identifier(b58)]) {
      for (const i in id.bytes) {
        expect(id.bytes[i]).toBe(bytes[i]);
      }
      expect(id.type).toBe(type);
      for (const i in id.value) {
        expect(id.value[i]).toBe(value[i]);
      }
      expect(id.toBase58()).toEqual(Base58.encode(new Uint8Array(bytes)));
    }
  }
});
