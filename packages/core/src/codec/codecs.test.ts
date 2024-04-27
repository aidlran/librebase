import { describe, expect, it } from 'vitest';
import { BinaryCodec, TextCodec } from './codecs';

describe('Binary codec', () => {
  const input = crypto.getRandomValues(new Uint8Array(8));

  it('Decodes', () => {
    expect(BinaryCodec.decode(input)).toBe(input);
  });

  describe('Encoder', () => {
    it('Encodes a byte array', () => {
      expect(BinaryCodec.encode(input)).toBe(input);
    });

    it('Rejects non byte array', () => {
      expect(() => BinaryCodec.encode({} as never)).toThrow();
    });
  });
});

describe('Text codec', () => {
  const input = String.fromCharCode(...crypto.getRandomValues(new Uint8Array(8)));
  const output = new TextEncoder().encode(input);

  it('Decodes', () => {
    expect(TextCodec.decode(output)).toBe(input);
  });

  describe('Encoder', () => {
    it('Encodes a string', () => {
      expect(TextCodec.encode(input)).toEqual(output);
    });

    it('Rejects non string', () => {
      expect(() => TextCodec.encode({} as never)).toThrow();
    });
  });
});
