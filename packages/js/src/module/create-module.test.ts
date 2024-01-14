import { describe, expect, it, test } from 'vitest';
import { createModule } from './create-module.js';

describe('create module', () => {
  test('creates with set constructor', () => {
    const getModule = createModule(() => new Set());
    expect(getModule).toBeTypeOf('function');
    expect(getModule()).toBeInstanceOf(Set);
  });

  test('creates with array literal', () => {
    const getModule = createModule(() => []);
    expect(getModule).toBeTypeOf('function');
    expect(getModule()).toBeInstanceOf(Array);
  });

  it('tracks instances', () => {
    const getModule = createModule(() => new Array<string>());
    const instanceDefault = getModule();
    const instanceA = getModule('app A');
    const instanceB = getModule('app B');
    expect(getModule()).toBe(instanceDefault);
    expect(getModule('app A')).toBe(instanceA);
    expect(getModule('app B')).toBe(instanceB);
  });

  it('allows stacked calls', () => {
    const getModuleA = createModule(() => []);
    const getModuleB = createModule((key) => {
      getModuleA(key);
      return [];
    });
    expect(getModuleB()).toBeInstanceOf(Array);
  });

  it('detects and throws circular dependencies', () => {
    let getModuleA: (appID?: string) => never[];
    const getModuleB = createModule((key) => {
      getModuleA(key);
      return [];
    });
    getModuleA = createModule((key) => {
      getModuleB(key);
      return [];
    });
    expect(() => getModuleA()).toThrowError();
    expect(() => getModuleB()).toThrowError();
  });
});
