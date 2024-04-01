import { describe, expect, test } from 'vitest';
import { bytesToString, shred, stringToBytes } from './buffer-utils';
import { encodes } from './test/encodes';

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
});
