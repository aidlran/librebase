import { RegistryError } from '@astrobase/core/internal';
import mediaTypes from 'mime-db';
import { describe, expect, it, test } from 'vitest';
import { CodecRegistry, decodeWithCodec, encodeWithCodec, type Codec } from './codecs.js';

describe('Codec functions', () => {
  const instanceID = 'codec-functions';
  const mockCodec: Codec = {
    decode: (payload) => payload,
    encode: (data) => data as Uint8Array,
  };

  const input = crypto.getRandomValues(new Uint8Array(8));
  const noCodecMediaType = 'test/no-codec';

  describe('Registration', () => {
    const decode: Codec['decode'] = (v) => v;
    const encode: Codec['encode'] = (v) => v as Uint8Array;

    describe('Key validation', () => {
      const options = { instanceID: 'Codec Registration Key Validation' };

      describe('Valid keys', () => {
        const valid = Object.keys(mediaTypes);

        for (const key of valid) {
          test(key, () => {
            const codec = { key, decode, encode };
            expect(CodecRegistry.register(codec, options)).toBeUndefined();
          });
        }
      });

      describe('Invalid keys', () => {
        const invalid = [23, 'applicationjson', 'application/json/'] as never[];

        for (const key of invalid) {
          test(key, () => {
            const codec = { key, decode, encode };
            expect(() => CodecRegistry.register(codec, options)).toThrow(RegistryError);
          });
        }
      });
    });

    describe('Codec validation', () => {
      const options = { instanceID: 'Codec Registration Value Validation' };

      describe('Valid codecs', () => {
        const valid = [{ key: 'test/a', decode, encode }];

        for (const codec of valid) {
          test(JSON.stringify(codec), () => {
            expect(CodecRegistry.register(codec, options)).toBeUndefined();
          });
        }
      });

      describe('Invalid codecs', () => {
        const invalid = [
          { key: 'test/b' },
          { key: 'test/c', decode },
          { key: 'test/d', encode },
        ] as never[];

        for (const codec of invalid) {
          test(JSON.stringify(codec), () => {
            expect(() => CodecRegistry.register(codec, options)).toThrow(RegistryError);
          });
        }
      });
    });
  });

  describe('Decode with codec', () => {
    it('Throws if no codec', () => {
      for (const mediaType of [noCodecMediaType, { type: noCodecMediaType }]) {
        const request = decodeWithCodec(new Uint8Array(), mediaType, instanceID);
        expect(request).rejects.toThrow(RegistryError);
      }
    });

    it('Decodes', async () => {
      const key = 'test/decode';
      CodecRegistry.register(mockCodec, { key, instanceID });
      await expect(decodeWithCodec(input, key, instanceID)).resolves.toBe(input);
      await expect(decodeWithCodec(input, { type: key }, instanceID)).resolves.toBe(input);
    });
  });

  describe('Encode with codec', () => {
    it('Throws if no codec', () => {
      for (const mediaType of [noCodecMediaType, { type: noCodecMediaType }]) {
        const request = encodeWithCodec({}, mediaType, instanceID);
        expect(request).rejects.toThrow(RegistryError);
      }
    });

    it('Encodes', async () => {
      const key = 'test/encode';
      CodecRegistry.register(mockCodec, { key, instanceID });
      await expect(encodeWithCodec(input, key, instanceID)).resolves.toBe(input);
      await expect(encodeWithCodec(input, { type: key }, instanceID)).resolves.toBe(input);
    });
  });
});
