import { describe, expect, it, test } from 'vitest';
import { encodes } from '../testing/encodes';
import { bytesToString, identifierToBytes, payloadToBytes, stringToBytes } from './buffer-utils';

describe('Buffer utilities', () => {
  describe('bytesToString', () => {
    for (const [string, bytes] of encodes) {
      test(string, () => {
        expect(bytesToString(bytes)).toBe(string);
      });
    }
  });

  describe('stringToBytes', () => {
    for (const [string, bytes] of encodes) {
      test(string, () => {
        expect(stringToBytes(string)).toEqual(bytes);
      });
    }
  });

  describe('identifierToBytes', () => {
    for (const [ascii, bytes, b58] of encodes) {
      test(`Uint8Array (${ascii})`, () => expect(identifierToBytes(bytes)).toEqual(bytes));
      test(`ArrayBuffer (${ascii})`, () => expect(identifierToBytes(bytes.buffer)).toEqual(bytes));
      test(`Base58 string (${ascii})`, () => expect(identifierToBytes(b58)).toEqual(bytes));
    }

    it('Rejects non-base58 encoded string', () => {
      const input = String.fromCharCode(...Array.from({ length: 128 }, (_, k) => k));
      expect(() => identifierToBytes(input)).toThrow();
    });
  });

  describe('payloadToBytes', () => {
    for (const [ascii, bytes, , b64] of encodes) {
      test(`Uint8Array (${ascii})`, () => expect(payloadToBytes(bytes)).toEqual(bytes));
      test(`ArrayBuffer (${ascii})`, () => expect(payloadToBytes(bytes.buffer)).toEqual(bytes));
      test(`Base64 string (${ascii})`, () => expect(payloadToBytes(b64)).toEqual(bytes));
    }

    it('Rejects non-base64 encoded string', () => {
      const input = String.fromCharCode(...Array.from({ length: 128 }, (_, k) => k));
      expect(() => payloadToBytes(input)).toThrow();
    });
  });
});
