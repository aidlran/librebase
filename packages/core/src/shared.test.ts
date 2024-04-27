import { describe, expect, it } from 'vitest';
import { encodes } from '../testing/encodes';
import { textDecoder, textEncoder } from './shared';

describe('Shared TextDecoder', () => {
  for (const [string, bytes] of encodes) {
    it('decodes ' + string, () => {
      expect(textDecoder.decode(bytes)).toStrictEqual(string);
    });
  }
});

describe('Shared TextEncoder', () => {
  for (const [string, bytes] of encodes) {
    it('encodes ' + string, () => {
      expect(textEncoder.encode(string)).toStrictEqual(bytes);
    });
  }
});
