import { describe, expect, test } from 'vitest';
import {
  IdentifierRegistry,
  encodeIdentifier,
  parseIdentifier,
  type IdentifierSchema,
} from './identifiers';
import { RegistryError } from '../internal/registry';

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

test('Identifier serialization', () => {
  for (const {
    encoded,
    decoded: { type, payload },
  } of [
    {
      encoded: [1, 2, 3, 4],
      decoded: { type: 1, payload: [2, 3, 4] },
    },
    {
      encoded: [232, 7, 2, 3, 4],
      decoded: { type: 1000, payload: [2, 3, 4] },
    },
  ]) {
    expect(encodeIdentifier(type, payload)).toEqual(new Uint8Array(encoded));
    expect(parseIdentifier(encoded)).toEqual([type, new Uint8Array(payload)]);
  }
});
