import { describe, expect, it, test } from 'vitest';
import { encodes } from '../../testing/encodes';
import * as m from './encoding';

describe('Base58', () => {
  for (const [string, bytes, b58] of encodes) {
    it(`encodes ${string}`, () => {
      expect(m.Base58.encode(bytes)).toBe(b58);
    });

    it(`decodes ${string}`, () => {
      expect(m.Base58.decode(b58)).toEqual(bytes);
    });
  }

  for (const [string, bytes, , b64] of encodes) {
    it(`encodes ${string}`, () => {
      expect(m.Base64.encode(bytes)).toBe(b64);
    });

    it(`decodes ${string}`, () => {
      expect(m.Base64.decode(b64)).toEqual(bytes);
    });
  }
});

describe('Buffer utilities', () => {
  describe('bytesToString', () => {
    for (const [string, bytes] of encodes) {
      test(string, () => {
        expect(m.bytesToString(bytes)).toBe(string);
      });
    }
  });

  describe('stringToBytes', () => {
    for (const [string, bytes] of encodes) {
      test(string, () => {
        expect(m.stringToBytes(string)).toEqual(bytes);
      });
    }
  });

  describe('identifierToBytes', () => {
    for (const [ascii, bytes, b58] of encodes) {
      test(`Uint8Array (${ascii})`, () => expect(m.identifierToBytes(bytes)).toEqual(bytes));
      test(`ArrayBuffer (${ascii})`, () =>
        expect(m.identifierToBytes(bytes.buffer)).toEqual(bytes));
      test(`Base58 string (${ascii})`, () => expect(m.identifierToBytes(b58)).toEqual(bytes));
    }

    it('Rejects non-base58 encoded string', () => {
      const input = String.fromCharCode(...Array.from({ length: 128 }, (_, k) => k));
      expect(() => m.identifierToBytes(input)).toThrow();
    });
  });

  describe('payloadToBytes', () => {
    for (const [ascii, bytes, , b64] of encodes) {
      test(`Uint8Array (${ascii})`, () => expect(m.payloadToBytes(bytes)).toEqual(bytes));
      test(`ArrayBuffer (${ascii})`, () => expect(m.payloadToBytes(bytes.buffer)).toEqual(bytes));
      test(`Base64 string (${ascii})`, () => expect(m.payloadToBytes(b64)).toEqual(bytes));
    }

    it('Rejects non-base64 encoded string', () => {
      const input = String.fromCharCode(...Array.from({ length: 128 }, (_, k) => k));
      expect(() => m.payloadToBytes(input)).toThrow();
    });
  });
});
