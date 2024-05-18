import { describe, expect, test } from 'vitest';
import { IdentifierRegistry, type IdentifierSchema } from './schema';
import { RegistryError } from '../registry';

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
