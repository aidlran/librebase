import { describe, expect, test } from 'vitest';
import { encodes } from '../../testing/encodes';
import { getMultipleEncodings } from './multiple-encode';

describe('getMultipleEncodings', () => {
  for (const [string, raw, base58, base64] of encodes) {
    describe(string, () => {
      const expected = { raw, base58, base64 };

      test('Raw input', () => {
        expect(getMultipleEncodings(raw, 'raw', ['base58', 'base64'])).toEqual(expected);
      });

      test('Base58 input', () => {
        expect(getMultipleEncodings(base58, 'base58', ['base64'])).toEqual(expected);
      });

      test('Base64 input', () => {
        expect(getMultipleEncodings(base64, 'base64', ['base58'])).toEqual(expected);
      });
    });
  }
});
