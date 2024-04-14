import { describe, expect, it, test } from 'vitest';
import { textDecoder, textEncoder } from '../../shared';
import { jsonCodec } from './codec';
import type { JsonCodecPlugin } from './types';

const props = { mediaType: { type: 'application/json' } };

const commonCases: [unknown, string][] = [
  { test: 'Test' },
  ['Test1', 'Test2'],
  { nested: { a: 1, b: 2 } },
].map((obj) => [obj, JSON.stringify(obj)]);

const noOpPlugin: JsonCodecPlugin = {
  replacer: (_, value) => value,
  reviver: (_, value) => value,
};

const noOpAsyncPlugin: JsonCodecPlugin = {
  replacer: (_, value) => Promise.resolve(value),
  reviver: (_, value) => Promise.resolve(value),
};

const stringPlugin: JsonCodecPlugin = {
  replacer: (_, value) => (value === 'abcdefg' ? 'replace_abcdefg' : value),
  reviver: (_, value) => (value === 'replace_abcdefg' ? 'abcdefg' : value),
};

const stringReplaceCases: [unknown, string][] = [
  ['abcdefg', '"replace_abcdefg"'],
  [['abcdefg'], '["replace_abcdefg"]'],
  [{ test: 'abcdefg' }, '{"test":"replace_abcdefg"}'],
];

describe('JSON codec', () => {
  it('is defined', () => {
    const json = jsonCodec();
    expect(json.decode).toBeTypeOf('function');
    expect(json.encode).toBeTypeOf('function');
  });

  test('JSON encoder throws when circular reference encountered', () => {
    const { encode } = jsonCodec();
    const obj: Record<string, unknown> = {};
    obj.obj = obj;
    expect(encode(obj, props)).rejects.toThrow('Circular reference');
  });

  describe('JSON decoding (no plugins)', () => {
    const { decode } = jsonCodec();
    for (const [input, output] of commonCases) {
      test(output, async () => {
        const decoded = await decode(textEncoder.encode(output), props);
        expect(decoded).toEqual(input);
      });
    }
  });

  describe('JSON encoding (no plugins)', () => {
    const { encode } = jsonCodec();
    for (const [input, output] of commonCases) {
      test(output, async () => {
        const encodedBin = await encode(input, props);
        const encodedString = textDecoder.decode(encodedBin);
        expect(encodedString).toBe(output);
      });
    }
  });

  describe('JSON decoding (no-op plugin)', () => {
    const { decode } = jsonCodec(noOpPlugin);
    for (const [input, output] of commonCases) {
      test(output, async () => {
        const decoded = await decode(textEncoder.encode(output), props);
        expect(decoded).toEqual(input);
      });
    }
  });

  describe('JSON encoding (no-op plugin)', () => {
    const { encode } = jsonCodec(noOpPlugin);
    for (const [input, output] of commonCases) {
      test(output, async () => {
        const encodedBin = await encode(input, props);
        const encodedString = textDecoder.decode(encodedBin);
        expect(encodedString).toBe(output);
      });
    }
  });

  describe('JSON encoding (no-op async plugin)', () => {
    const { encode } = jsonCodec(noOpAsyncPlugin);
    for (const [input, output] of commonCases) {
      test(output, async () => {
        const encodedBin = await encode(input, props);
        const encodedString = textDecoder.decode(encodedBin);
        expect(encodedString).toBe(output);
      });
    }
  });

  describe('JSON decoding (string replacer plugin)', () => {
    const { decode } = jsonCodec(stringPlugin);
    for (const [input, output] of [...commonCases, ...stringReplaceCases]) {
      test(output, async () => {
        const decoded = await decode(textEncoder.encode(output), props);
        expect(decoded).toEqual(input);
      });
    }
  });

  describe('JSON encoding (string replacer plugin)', () => {
    const { encode } = jsonCodec(stringPlugin);
    for (const [input, output] of [...commonCases, ...stringReplaceCases]) {
      test(output, async () => {
        const encodedBin = await encode(input, props);
        const encodedString = textDecoder.decode(encodedBin);
        expect(encodedString).toBe(output);
      });
    }
  });
});
