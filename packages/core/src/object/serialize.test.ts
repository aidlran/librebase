import { format, type MediaType } from 'content-type';
import { afterAll, beforeAll, describe, expect, it, test } from 'vitest';
import { mockJSONCodec } from '../../testing/codecs';
import { registerCodec } from '../codec';
import { textEncoder } from '../shared';
import { serializeObject } from './serialize';

describe('Serialize object', () => {
  const instanceID = 'serialize-object';

  beforeAll(() => {
    registerCodec('application/json', mockJSONCodec, instanceID);
  });

  afterAll(() => {
    registerCodec('application/json', undefined, instanceID);
  });

  describe('Serializes valid objects', () => {
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
        expect(serializeObject(value, mediaType, { instanceID })).resolves.toEqual(object);
      });
    }
  });

  it('Serializes a valid pre-encoded object', () => {
    const mediaTypeString = 'application/json';
    const mediaTypeBin = textEncoder.encode(mediaTypeString);
    const payload = textEncoder.encode(JSON.stringify({ test: 'test' }));
    const object = new Uint8Array([1, ...mediaTypeBin, 0, ...payload]);
    expect(
      serializeObject(payload, mediaTypeString, { encoded: true, instanceID }),
    ).resolves.toEqual(object);
  });

  it('Throws on unexpected non-encoded payload', () => {
    const payload = { test: 'test' } as never;
    const request = serializeObject(payload, 'application/json', { encoded: true, instanceID });
    expect(request).rejects.toThrow('Expected Uint8Array');
  });

  describe('Media type validation', () => {
    const badMediaType = String.fromCharCode(...Array.from({ length: 16 }, (_, k) => k));

    it('Throws on bad media type', () => {
      const request = serializeObject(new Uint8Array(8), badMediaType, {
        encoded: true,
        instanceID,
      });
      expect(request).rejects.toThrow('Bad media type');
    });

    it('Skips validation with trust option enabled', () => {
      const payload = new Uint8Array(8);
      const request = serializeObject(payload, badMediaType, {
        encoded: true,
        instanceID,
        trust: true,
      });
      const object = new Uint8Array([1, ...textEncoder.encode(badMediaType), 0, ...payload]);
      expect(request).resolves.toEqual(object);
    });
  });
});