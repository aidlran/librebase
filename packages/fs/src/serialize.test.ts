import { format, type MediaType } from 'content-type';
import { beforeAll, describe, expect, it, test } from 'vitest';
import { mockJSONCodec } from '../testing/codecs';
import { registerCodec } from './codec';
import { serializeFsContent } from './serialize';

describe('Serialize FS content', () => {
  const instanceID = 'serialize-object';
  const textEncoder = new TextEncoder();

  beforeAll(() => {
    registerCodec(mockJSONCodec, { instanceID });
  });

  describe('Serializes valid FS content', () => {
    const tests: [unknown, string | MediaType][] = [
      [{ test: 'test' }, 'application/json'],
      [{ test: 'test' }, { type: 'application/json' }],
    ];
    for (const [value, mediaType] of tests) {
      test(typeof value + ' value + ' + typeof mediaType + ' media type', () => {
        const mediaTypeString = typeof mediaType === 'string' ? mediaType : format(mediaType);
        const mediaTypeBin = textEncoder.encode(mediaTypeString);
        const payload = textEncoder.encode(JSON.stringify(value));
        const object = new Uint8Array([1, ...mediaTypeBin, 0, ...payload]);
        expect(serializeFsContent(value, mediaType, { instanceID })).resolves.toEqual(object);
      });
    }
  });

  it('Serializes a valid pre-encoded FS content', () => {
    const mediaTypeString = 'application/json';
    const mediaTypeBin = textEncoder.encode(mediaTypeString);
    const payload = textEncoder.encode(JSON.stringify({ test: 'test' }));
    const object = new Uint8Array([1, ...mediaTypeBin, 0, ...payload]);
    expect(
      serializeFsContent(payload, mediaTypeString, { encoded: true, instanceID }),
    ).resolves.toEqual(object);
  });

  it('Throws on unexpected non-encoded payload', () => {
    const payload = { test: 'test' } as never;
    const request = serializeFsContent(payload, 'application/json', { encoded: true, instanceID });
    expect(request).rejects.toThrow('Expected Uint8Array');
  });

  describe('Media type validation', () => {
    const badMediaType = String.fromCharCode(...Array.from({ length: 16 }, (_, k) => k));

    it('Throws on bad media type', () => {
      const request = serializeFsContent(new Uint8Array(8), badMediaType, {
        encoded: true,
        instanceID,
      });
      expect(request).rejects.toThrow('Bad media type');
    });

    it('Skips validation with trust option enabled', () => {
      const payload = new Uint8Array(8);
      const request = serializeFsContent(payload, badMediaType, {
        encoded: true,
        instanceID,
        trust: true,
      });
      const object = new Uint8Array([1, ...textEncoder.encode(badMediaType), 0, ...payload]);
      expect(request).resolves.toEqual(object);
    });
  });
});
