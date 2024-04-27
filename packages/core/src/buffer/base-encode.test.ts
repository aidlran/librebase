import { describe, expect, it } from 'vitest';
import { encodes } from '../../testing/encodes';
import { base58, base64 } from './base-encode';

describe('Base58', () => {
  for (const [string, bytes, b58] of encodes) {
    it(`encodes ${string}`, () => {
      expect(base58.encode(bytes)).toBe(b58);
    });

    it(`decodes ${string}`, () => {
      expect(base58.decode(b58)).toEqual(bytes);
    });
  }

  for (const [string, bytes, , b64] of encodes) {
    it(`encodes ${string}`, () => {
      expect(base64.encode(bytes)).toBe(b64);
    });

    it(`decodes ${string}`, () => {
      expect(base64.decode(b64)).toEqual(bytes);
    });
  }
});
