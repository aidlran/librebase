import { describe, expect, it } from 'vitest';
import { encodes } from '../testing/encodes';
import { Base58, Base64 } from './base-encode';

describe('Base58', () => {
  for (const [string, bytes, b58] of encodes) {
    it(`encodes ${string}`, () => {
      expect(Base58.encode(bytes)).toBe(b58);
    });

    it(`decodes ${string}`, () => {
      expect(Base58.decode(b58)).toEqual(bytes);
    });
  }

  for (const [string, bytes, , b64] of encodes) {
    it(`encodes ${string}`, () => {
      expect(Base64.encode(bytes)).toBe(b64);
    });

    it(`decodes ${string}`, () => {
      expect(Base64.decode(b64)).toEqual(bytes);
    });
  }
});
