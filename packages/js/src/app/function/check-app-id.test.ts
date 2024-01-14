import { describe, expect, test } from 'vitest';
import { checkAppID } from './check-app-id.js';
import { UUID_TESTS } from './test/uuids.js';

describe('checkAppID', () => {
  for (const [value, isValid] of UUID_TESTS) {
    test(`${value} should ${isValid ? 'pass' : 'fail'}`, () => {
      expect(checkAppID(value)).toBe(isValid);
    });
  }
});
