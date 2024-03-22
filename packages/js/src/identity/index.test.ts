import '@vitest/web-worker';
import { describe, expect, it } from 'vitest';
import { resolveBeforeTimeout } from '../../testing/utils';
import { getIdentity } from '.';

describe('getIdentity', () => {
  it.todo('throws if no keyring is active', () => {
    expect(() => {
      return resolveBeforeTimeout(getIdentity('test'), 1000);
    }).rejects.not.toThrowError('Timed out');
  });
});
