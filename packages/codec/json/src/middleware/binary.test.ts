import { describe, expect, test } from 'vitest';
import { encodes } from '../../../../core/testing/encodes';
import { binary } from './binary';

describe('JSON codec binary plugin', () => {
  describe('Replacer', () => {
    describe('Replaces Uint8Array or ArrayBuffer', () => {
      for (const [ascii, bin, , b64] of encodes) {
        test(ascii, () => {
          const encoded = `$bin:b64:${b64}`;
          expect(binary.replacer(undefined, bin)).toBe(encoded);
          expect(binary.replacer(undefined, bin.buffer)).toBe(encoded);
        });
      }
    });

    describe('Ignores other types', () => {
      for (const input of ['abc', {}, []]) {
        test(typeof input === 'string' ? input : JSON.stringify(input), () => {
          expect(binary.replacer(undefined, input)).toBe(input);
        });
      }
    });
  });

  describe('Reviver', () => {
    describe('Revives valid string', () => {
      for (const [ascii, bin, , b64] of encodes) {
        const encoded = `$bin:b64:${b64}`;
        test(ascii, () => expect(binary.reviver(undefined, encoded)).toEqual(bin));
      }
    });

    describe('Ignores other strings and types', () => {
      for (const input of ['abc', {}, []]) {
        test(typeof input === 'string' ? input : JSON.stringify(input), () => {
          expect(binary.reviver(undefined, input)).toBe(input);
        });
      }
    });
  });
});
