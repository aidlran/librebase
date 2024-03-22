import { beforeEach, describe, expect, it } from 'vitest';
import { mediaTypeSignal } from './media-type-signal';
import type { MediaType } from 'content-type';

describe('MediaType signal', () => {
  const chainedReturn = {};
  let mediaType: () => MediaType, setMediaType: (v: string | MediaType) => unknown;

  beforeEach(() => {
    [mediaType, setMediaType] = mediaTypeSignal(chainedReturn);
  });

  it('accepts a valid string', () => {
    expect(mediaType()).not.toEqual({ type: 'text/plain', parameters: {} });
    expect(() => setMediaType('text/plain')).not.toThrow();
    expect(mediaType()).toEqual({ type: 'text/plain', parameters: {} });
  });

  it('rejects an invalid string', () => {
    expect(() => setMediaType('text')).toThrowError(TypeError);
  });

  it('accepts a valid MediaType interface', () => {
    expect(mediaType()).not.toEqual({ type: 'text/plain' });
    expect(() => setMediaType({ type: 'text/plain' })).not.toThrow();
    expect(mediaType()).toEqual({ type: 'text/plain' });
  });

  it('rejects an invalid MediaType interface', () => {
    expect(() => setMediaType({ type: 'text' })).toThrowError(TypeError);
  });

  it('uses method chaining', () => {
    expect(setMediaType('text/plain')).toBe(chainedReturn);
  });
});
