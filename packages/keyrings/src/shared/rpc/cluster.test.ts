import { describe, expect, it, vitest } from 'vitest';
import { calculateClusterSize } from './cluster';

describe('calculateClusterSize', () => {
  it('provides default', () => {
    expect(typeof calculateClusterSize()).toBe('number');
  });

  it('works if hardwareConcurrency undefined', () => {
    vitest.spyOn(navigator as any, 'hardwareConcurrency', 'get').mockReturnValue(undefined);
    expect(typeof calculateClusterSize()).toBe('number');
  });

  it('respects ceiling', () => {
    vitest.spyOn(navigator, 'hardwareConcurrency', 'get').mockReturnValue(4);
    expect(calculateClusterSize(3)).toBe(3);
  });

  it('respects floor', () => {
    vitest.spyOn(navigator, 'hardwareConcurrency', 'get').mockReturnValue(4);
    expect(calculateClusterSize(8, 16)).toBe(8);
  });
});
