import { describe, expect, test } from 'vitest';
import { registerMiddleware, type CodecMiddleware } from '../middleware/index.js';
import { JSONCodec } from './codec.js';

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

const props = { mediaType: { type: 'application/json' } };

const commonCases: [unknown, string][] = [
  { test: 'Test' },
  ['Test1', 'Test2'],
  { nested: { a: 1, b: 2 } },
].map((obj) => [obj, JSON.stringify(obj)]);

const noOpMiddleware: CodecMiddleware = {
  replacer: (_, value) => value,
  reviver: (_, value) => value,
};

const noOpMiddlewareAsync: CodecMiddleware = {
  replacer: (_, value) => Promise.resolve(value),
  reviver: (_, value) => Promise.resolve(value),
};

const stringReplaceMiddleware: CodecMiddleware = {
  replacer: (_, value) => (value === 'abcdefg' ? 'replace_abcdefg' : value),
  reviver: (_, value) => (value === 'replace_abcdefg' ? 'abcdefg' : value),
};

const stringReplaceCases: [unknown, string][] = [
  ['abcdefg', '"replace_abcdefg"'],
  [['abcdefg'], '["replace_abcdefg"]'],
  [{ test: 'abcdefg' }, '{"test":"replace_abcdefg"}'],
];

describe('JSON codec', () => {
  test('JSON encoder throws when circular reference encountered', () => {
    const obj: Record<string, unknown> = {};
    obj.obj = obj;
    expect(JSONCodec.encode(obj, props)).rejects.toThrow('Circular reference');
  });

  describe('JSON decoding (no plugins)', () => {
    for (const [input, output] of commonCases) {
      test(output, async () => {
        const decoded = await JSONCodec.decode(textEncoder.encode(output), props);
        expect(decoded).toEqual(input);
      });
    }
  });

  describe('JSON encoding (no plugins)', () => {
    for (const [input, output] of commonCases) {
      test(output, async () => {
        const encodedBin = await JSONCodec.encode(input, props);
        const encodedString = textDecoder.decode(encodedBin);
        expect(encodedString).toBe(output);
      });
    }
  });

  describe('No-op middleware', () => {
    const instanceID = 'NoOpMiddleware';
    const suiteProps = { ...props, instanceID };
    registerMiddleware(noOpMiddleware, instanceID);

    describe('Decoding', () => {
      for (const [input, output] of commonCases) {
        test(output, async () => {
          const decoded = await JSONCodec.decode(textEncoder.encode(output), suiteProps);
          expect(decoded).toEqual(input);
        });
      }
    });

    describe('Encoding', () => {
      for (const [input, output] of commonCases) {
        test(output, async () => {
          const encodedBin = await JSONCodec.encode(input, suiteProps);
          const encodedString = textDecoder.decode(encodedBin);
          expect(encodedString).toBe(output);
        });
      }
    });
  });

  describe('Encoding (async no-op middleware)', () => {
    const instanceID = 'NoOpAsyncMiddleware';
    const suiteProps = { ...props, instanceID };
    registerMiddleware(noOpMiddlewareAsync, instanceID);

    for (const [input, output] of commonCases) {
      test(output, async () => {
        const encodedBin = await JSONCodec.encode(input, suiteProps);
        const encodedString = textDecoder.decode(encodedBin);
        expect(encodedString).toBe(output);
      });
    }
  });

  describe('String replacer middleware', () => {
    const instanceID = 'StringReplacerMiddleware';
    const suiteProps = { ...props, instanceID };
    registerMiddleware(stringReplaceMiddleware, instanceID);

    describe('Decoding ', () => {
      for (const [input, output] of [...commonCases, ...stringReplaceCases]) {
        test(output, async () => {
          const decoded = await JSONCodec.decode(textEncoder.encode(output), suiteProps);
          expect(decoded).toEqual(input);
        });
      }
    });

    describe('Encoding', () => {
      for (const [input, output] of [...commonCases, ...stringReplaceCases]) {
        test(output, async () => {
          const encodedBin = await JSONCodec.encode(input, suiteProps);
          const encodedString = textDecoder.decode(encodedBin);
          expect(encodedString).toBe(output);
        });
      }
    });
  });
});
