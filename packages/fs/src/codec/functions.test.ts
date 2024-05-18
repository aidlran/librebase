import { getModule } from '@librebase/core/internal';
import type { MediaType } from 'content-type';
import { describe, expect, it } from 'vitest';
import { codecMap } from './codec-map';
import { decodeWithCodec, encodeWithCodec, getCodec, registerCodec } from './functions';
import type { Codec } from './types';

describe('Codec functions', () => {
  const instanceID = 'codec-functions';
  const mockCodec: Codec = {
    decode: (payload) => payload,
    encode: (data) => data as Uint8Array,
  };

  describe('Register and get codec', () => {
    it.todo('Registers with codec-provided media type');
    it.todo('Registers with media type arrays');

    it('Registers with media type string', () => {
      const asMediaType = 'test/string';

      expect(getModule(codecMap, instanceID)[asMediaType]).toBeUndefined();
      expect(() => getCodec(asMediaType, instanceID)).toThrow('No codec');

      expect(registerCodec(mockCodec, { asMediaType, instanceID })).toBeUndefined();
      expect(getModule(codecMap, instanceID)[asMediaType]).toBe(mockCodec);
      expect(getCodec(asMediaType, instanceID)).toBe(mockCodec);
    });

    it('Registers with media type object', () => {
      const asMediaType: MediaType = { type: 'test/object' };

      expect(getModule(codecMap, instanceID)[asMediaType.type]).toBeUndefined();
      expect(() => getCodec(asMediaType, instanceID)).toThrow('No codec');

      expect(registerCodec(mockCodec, { asMediaType, instanceID })).toBeUndefined();
      expect(getModule(codecMap, instanceID)[asMediaType.type]).toBe(mockCodec);
      expect(getCodec(asMediaType, instanceID)).toBe(mockCodec);
    });
  });

  const input = crypto.getRandomValues(new Uint8Array(8));
  const noCodecMediaType = 'test/no-codec';

  describe('Decode with codec', () => {
    it('Throws if no codec', () => {
      for (const mediaType of [noCodecMediaType, { type: noCodecMediaType }]) {
        const request = decodeWithCodec(new Uint8Array(), mediaType, instanceID);
        expect(request).rejects.toThrow('No codec');
      }
    });

    it('Decodes', async () => {
      const asMediaType = 'test/decode';
      registerCodec(mockCodec, { asMediaType, instanceID });
      await expect(decodeWithCodec(input, asMediaType, instanceID)).resolves.toBe(input);
      await expect(decodeWithCodec(input, { type: asMediaType }, instanceID)).resolves.toBe(input);
    });
  });

  describe('Encode with codec', () => {
    it('Throws if no codec', () => {
      for (const mediaType of [noCodecMediaType, { type: noCodecMediaType }]) {
        const request = encodeWithCodec({}, mediaType, instanceID);
        expect(request).rejects.toThrow('No codec');
      }
    });

    it('Encodes', async () => {
      const asMediaType = 'test/encode';
      registerCodec(mockCodec, { asMediaType, instanceID });
      await expect(encodeWithCodec(input, asMediaType, instanceID)).resolves.toBe(input);
      await expect(encodeWithCodec(input, { type: asMediaType }, instanceID)).resolves.toBe(input);
    });
  });
});
