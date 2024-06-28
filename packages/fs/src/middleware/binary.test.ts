import { describe, expect, it, test } from 'vitest';
import { encodes } from '../../../core/testing/encodes.js';
import { Hash } from '../hashes.js';
import { binary } from './binary.js';

describe('JSON codec binary middleware', () => {
  for (const [ascii, bin, b58, b64] of encodes) {
    const b58Encoded = `$bin:b58:${b58}`;
    const b64Encoded = `$bin:b64:${b64}`;
    it('Replaces as ArrayBuffer - ' + ascii, () => {
      expect(binary.replacer(undefined, bin.buffer)).toBe(b64Encoded);
    });
    if (ascii) {
      it('Replaces as Hash - ' + ascii, () => {
        const hash = new Hash(bin[0], bin.subarray(1));
        expect(binary.replacer(undefined, hash)).toBe(b58Encoded);
      });
    }
    it('Replaces as Uint8Array - ' + ascii, () => {
      expect(binary.replacer(undefined, bin)).toBe(b64Encoded);
    });
    it('Revives as base58 - ' + ascii, () => {
      expect(binary.reviver(undefined, b58Encoded)).toEqual(bin);
    });
    it('Revives as base64 - ' + ascii, () => {
      expect(binary.reviver(undefined, b64Encoded)).toEqual(bin);
    });
  }

  for (const input of ['abc', {}, []]) {
    const inputAsString = JSON.stringify(input);
    test('Replacer ignores ' + inputAsString, () => {
      expect(binary.replacer(undefined, input)).toBe(input);
    });
    test('Reviver ignores ' + inputAsString, () => {
      expect(binary.reviver(undefined, input)).toBe(input);
    });
  }
});
