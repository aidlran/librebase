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
    it('Registers with media type string', () => {
      const mediaType = 'test/string';

      expect(getModule(codecMap, instanceID)[mediaType]).toBeUndefined();
      expect(() => getCodec(mediaType, instanceID)).toThrow('No codec');

      expect(registerCodec(mediaType, mockCodec, instanceID)).toBeUndefined();
      expect(getModule(codecMap, instanceID)[mediaType]).toBe(mockCodec);
      expect(getCodec(mediaType, instanceID)).toBe(mockCodec);

      expect(registerCodec(mediaType, undefined, instanceID)).toBeUndefined();
      expect(getModule(codecMap, instanceID)[mediaType]).toBeUndefined();
      expect(() => getCodec(mediaType, instanceID)).toThrow('No codec');
    });

    it('Registers with media type object', () => {
      const mediaType: MediaType = { type: 'test/object' };

      expect(getModule(codecMap, instanceID)[mediaType.type]).toBeUndefined();
      expect(() => getCodec(mediaType, instanceID)).toThrow('No codec');

      expect(registerCodec(mediaType, mockCodec, instanceID)).toBeUndefined();
      expect(getModule(codecMap, instanceID)[mediaType.type]).toBe(mockCodec);
      expect(getCodec(mediaType, instanceID)).toBe(mockCodec);

      expect(registerCodec(mediaType, undefined, instanceID)).toBeUndefined();
      expect(getModule(codecMap, instanceID)[mediaType.type]).toBeUndefined();
      expect(() => getCodec(mediaType, instanceID)).toThrow('No codec');
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
      const mediaType = 'test/decode';
      registerCodec(mediaType, mockCodec, instanceID);
      await expect(decodeWithCodec(input, mediaType, instanceID)).resolves.toBe(input);
      await expect(decodeWithCodec(input, { type: mediaType }, instanceID)).resolves.toBe(input);
      registerCodec(mediaType, undefined, instanceID);
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
      const mediaType = 'test/encode';
      registerCodec(mediaType, mockCodec, instanceID);
      await expect(encodeWithCodec(input, mediaType, instanceID)).resolves.toBe(input);
      await expect(encodeWithCodec(input, { type: mediaType }, instanceID)).resolves.toBe(input);
      registerCodec(mediaType, undefined, instanceID);
    });
  });
});
