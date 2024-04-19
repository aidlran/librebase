import mediaTypes from 'mime-db';
import { describe, expect, it, test } from 'vitest';
import { textEncoder } from '../shared';
import { validateObjectPayloadMediaType, validateObjectVersion } from './validate';

describe('Validate object payload media type', () => {
  describe('Should pass valid media types', () => {
    for (const mediaType of Object.keys(mediaTypes)) {
      test(mediaType, () => {
        expect(validateObjectPayloadMediaType(textEncoder.encode(mediaType))).toBe(true);
      });
    }
  });

  describe('Should fail if there there are control characters, DEL, or back slash', () => {
    const disallowedBytes = [
      // Control characters
      ...Array.from({ length: 0x20 }, (_, k) => k),
      // Back slash
      0x5c,
      // DEL
      0x7f,
    ];
    const baseMediaType = textEncoder.encode('text/plain');
    for (const byte of disallowedBytes) {
      test(byte.toString(16).padStart(2, '0'), () => {
        const mediaType = new Uint8Array([...baseMediaType, byte]);
        expect(validateObjectPayloadMediaType(mediaType)).toBe(false);
      });
    }
  });

  describe('Should fail if there there are 0 or 2 or more forward slash', () => {
    for (const mediaType of ['abc', 'a/b/c', 'a/b/c/']) {
      test(mediaType, () => {
        expect(validateObjectPayloadMediaType(textEncoder.encode(mediaType))).toBe(false);
      });
    }
  });

  describe('Should fail if first character is a slash', () => {
    for (const mediaType of ['/abc', '/a/bc']) {
      test(mediaType, () => {
        expect(validateObjectPayloadMediaType(textEncoder.encode(mediaType))).toBe(false);
      });
    }
  });
});

describe('Validate object version byte', () => {
  it('Should pass known versions', () => {
    expect(validateObjectVersion(1)).toBe(true);
  });

  it("Should fail future versions we don't know about", () => {
    for (let n = 2; n < 256; n++) {
      expect(validateObjectVersion(n)).toBe(false);
    }
  });

  it('Should fail invalid versions', () => {
    for (let n = 0; n > -999; n--) {
      expect(validateObjectVersion(n)).toBe(false);
    }
  });
});
