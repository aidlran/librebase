import { describe, expect, test } from 'vitest';
import { encodes } from '../../../../testing/encodes';
import { binaryPlugin } from './binary';

describe('JSON codec binary plugin', () => {
  describe('Replacer', () => {
    describe('Replaces Uint8Array or ArrayBuffer', () => {
      for (const [ascii, bin, , b64] of encodes) {
        test(ascii, () => {
          const encoded = `$bin:b64:${b64}`;
          expect(binaryPlugin.replacer(undefined, bin)).toBe(encoded);
          expect(binaryPlugin.replacer(undefined, bin.buffer)).toBe(encoded);
        });
      }
    });

    describe('Ignores other types', () => {
      for (const input of ['abc', {}, []]) {
        test(typeof input === 'string' ? input : JSON.stringify(input), () => {
          expect(binaryPlugin.replacer(undefined, input)).toBe(input);
        });
      }
    });
  });

  describe('Reviver', () => {
    describe('Revives valid string', () => {
      for (const [ascii, bin, , b64] of encodes) {
        const encoded = `$bin:b64:${b64}`;
        test(ascii, () => expect(binaryPlugin.reviver(undefined, encoded)).toEqual(bin));
      }
    });

    describe('Ignores other strings and types', () => {
      for (const input of ['abc', {}, []]) {
        test(typeof input === 'string' ? input : JSON.stringify(input), () => {
          expect(binaryPlugin.reviver(undefined, input)).toBe(input);
        });
      }
    });
  });
});
