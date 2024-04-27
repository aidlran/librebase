import { describe, expect, test } from 'vitest';
import { encodes } from '../../../../testing/encodes';
import { Hash } from '../../../hash';
import { hashPlugin } from './hash';

describe('JSON codec hash plugin', () => {
  describe('Replacer', () => {
    describe('Replaces Hash instance', () => {
      for (const [ascii, bin, b58] of encodes) {
        if (ascii) {
          const encoded = `#:b58:${b58}`;
          const hash = new Hash(bin[0], bin.subarray(1));
          test(ascii, () => expect(hashPlugin.replacer(undefined, hash)).toBe(encoded));
        }
      }
    });

    describe('Ignores other types', () => {
      for (const input of ['abc', {}, []]) {
        test(typeof input === 'string' ? input : JSON.stringify(input), () => {
          expect(hashPlugin.replacer(undefined, input)).toBe(input);
        });
      }
    });
  });

  describe('Reviver', () => {
    describe('Revives valid string', () => {
      for (const [ascii, bin, b58] of encodes) {
        if (ascii) {
          const encoded = `#:b58:${b58}`;
          const revived = hashPlugin.reviver(undefined, encoded);
          test(ascii, () => expect((revived as Hash).toBytes()).toEqual(bin));
        }
      }
    });

    describe('Ignores other strings and types', () => {
      for (const input of ['abc', {}, []]) {
        test(typeof input === 'string' ? input : JSON.stringify(input), () => {
          expect(hashPlugin.reviver(undefined, input)).toBe(input);
        });
      }
    });
  });
});
