import { describe, expect, it, test } from 'vitest';
import { encodes } from '../../testing/encodes';
import { Hash } from '../hash';
import {
  bytesToString,
  identifierToBytes,
  payloadToBytes,
  shred,
  stringToBytes,
} from './buffer-utils';

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

  test('shred', () => {
    // Initialise a buffer with random non-zero values
    let buffer: Uint8Array;
    do {
      buffer = crypto.getRandomValues(new Uint8Array(32));
    } while (buffer.find((v) => v == 0));
    shred(buffer);
    // After shredding, all values should be 0
    expect(buffer.find((v) => v != 0)).toBe(undefined);
  });

  describe('identifierToBytes', () => {
    for (const [ascii, bytes, b58] of encodes) {
      test(`Uint8Array (${ascii})`, () => expect(identifierToBytes(bytes)).toEqual(bytes));
      test(`ArrayBuffer (${ascii})`, () => expect(identifierToBytes(bytes.buffer)).toEqual(bytes));
      test(`Base58 string (${ascii})`, () => expect(identifierToBytes(b58)).toEqual(bytes));
      if (ascii) {
        const hash = new Hash(bytes[0], bytes.subarray(1));
        test(`Hash (${ascii})`, () => expect(identifierToBytes(hash)).toEqual(bytes));
      }
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
      if (ascii) {
        const hash = new Hash(bytes[0], bytes.subarray(1));
        test(`Hash (${ascii})`, () => expect(identifierToBytes(hash)).toEqual(bytes));
      }
    }

    it('Rejects non-base64 encoded string', () => {
      const input = String.fromCharCode(...Array.from({ length: 128 }, (_, k) => k));
      expect(() => payloadToBytes(input)).toThrow();
    });
  });
});
