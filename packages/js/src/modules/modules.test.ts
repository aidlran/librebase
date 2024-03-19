import { describe, expect, it, test } from 'vitest';
import { getModule, type Injector } from './modules';

describe('create module', () => {
  test('creates with set constructor', () => {
    expect(getModule(() => new Set())).toBeInstanceOf(Set);
  });

  test('creates with array literal', () => {
    expect(getModule(() => [])).toBeInstanceOf(Array);
  });

  it('tracks instances', () => {
    const m = () => [];
    const instanceDefault = getModule(m);
    const instanceA = getModule(m, 'app A');
    const instanceB = getModule(m, 'app B');
    expect(getModule(m)).toBe(instanceDefault);
    expect(getModule(m, 'app A')).toBe(instanceA);
    expect(getModule(m, 'app B')).toBe(instanceB);
  });

  it('allows stacked calls', () => {
    const moduleA = () => [];
    function moduleB(this: Injector) {
      this(moduleA);
      return [];
    }
    expect(getModule(moduleB)).toBeInstanceOf(Array);
  });

  it('detects and throws circular dependencies', () => {
    let moduleA: () => [];
    function moduleB(this: Injector) {
      this(moduleA);
      return [];
    }
    moduleA = function (this: Injector) {
      this(moduleB);
      return [];
    };
    expect(() => getModule(moduleA)).toThrowError();
    expect(() => getModule(moduleB)).toThrowError();
  });
});
