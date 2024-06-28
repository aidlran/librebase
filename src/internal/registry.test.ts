import { describe, expect, test } from 'vitest';
import { Registry, RegistryError, type RegistryModule } from './registry.js';

describe('Registry', () => {
  describe('Get', () => {
    test('Single key', () => {
      const registry = new Registry();
      const key = 1;
      const thing = { key };

      expect(registry.get(key)).toBeUndefined();
      expect(() => registry.getStrict(key)).toThrow(RegistryError);

      registry.register(thing);

      expect(registry.get(key)).toBe(thing);
      expect(registry.getStrict(key)).toBe(thing);
    });

    test('Multiple keys', () => {
      const registry = new Registry();
      const key = [1, 2, 3];

      const thing = { key };

      for (const k of key) {
        expect(registry.get(k)).toBeUndefined();
        expect(() => registry.getStrict(k)).toThrow(RegistryError);
      }

      registry.register(thing);

      for (const k of key) {
        expect(registry.get(k)).toBe(thing);
        expect(registry.getStrict(k)).toBe(thing);
      }
    });
  });

  describe('Register', () => {
    test('Value validator', () => {
      const registry = new Registry<number, RegistryModule<number> & { test: string }>({
        validateModule: (v) => v.test === 'test',
      });

      const validThing = { key: 1, test: 'test' };
      expect(registry.register(validThing)).toBeUndefined();
      expect(registry.get(validThing.key)).toBe(validThing);

      const invalidThing = { key: 2, test: 'invalid' };
      expect(() => registry.register(invalidThing)).toThrow(RegistryError);
      expect(registry.get(invalidThing.key)).toBeUndefined();
    });

    test('Key is required', () => {
      const registry = new Registry();
      expect(registry.register({ key: 1 })).toBeUndefined();
      expect(registry.register({}, { key: 2 })).toBeUndefined();
      expect(() => registry.register({})).toThrow(RegistryError);
    });

    test('Key validator', () => {
      const registry = new Registry({
        validateKey: (k) => typeof k === 'number',
      });

      const validThing = { key: 1 };
      expect(registry.register(validThing)).toBeUndefined();
      expect(registry.get(validThing.key)).toBe(validThing);

      const invalidThing = { key: '2' };
      expect(() => registry.register(invalidThing)).toThrow(RegistryError);
      expect(registry.get(invalidThing.key)).toBeUndefined();
    });

    test('Key in use and force override', () => {
      const registry = new Registry();
      const oldValue = { key: 1 };
      registry.register(oldValue);
      expect(registry.get(1)).toBe(oldValue);

      const newValue = { key: 1 };
      expect(() => registry.register(newValue)).toThrow(RegistryError);
      expect(registry.register(newValue, { force: true })).toBeUndefined();
      expect(registry.get(1)).toBe(newValue);
    });

    test('Instance isolation', () => {
      const registry = new Registry();
      const key = 1;
      const thing1 = { key };
      const thing2 = { key };

      expect(registry.get(key)).toBeUndefined();

      registry.register(thing1);

      expect(registry.get(key)).toBe(thing1);
      expect(registry.get(key, 'a')).toBeUndefined();

      registry.register(thing2, { instanceID: 'a' });

      expect(registry.get(key, 'a')).not.toBe(thing1);
      expect(registry.get(key, 'a')).toBe(thing2);
    });
  });

  test('Defaults', () => {
    const defaultModule = {};
    const registry = new Registry<number, RegistryModule<number>>({
      defaults: {
        123: defaultModule,
      },
    });

    expect(registry.get(123)).toBe(defaultModule);
    expect(registry.get(123), 'withAnInstanceID').toBe(defaultModule);
    expect(registry.get(456)).toBeUndefined();

    const instanceID = 'onlyScopedToThisInstance';
    const registerModule = { key: 123 };
    registry.register(registerModule, { instanceID });

    expect(registry.get(123)).not.toBe(registerModule);
    expect(registry.get(123)).toBe(defaultModule);
    expect(registry.get(123, instanceID)).not.toBe(defaultModule);
    expect(registry.get(123, instanceID)).toBe(registerModule);

    expect(registry.get(123), 'different').not.toBe(registerModule);
    expect(registry.get(123), 'different').toBe(defaultModule);
    expect(registry.get(456)).toBeUndefined();
  });
});
