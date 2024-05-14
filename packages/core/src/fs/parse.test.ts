import { describe, expect, it } from 'vitest';
import { parseFsContent } from './parse';

describe('Parse serialized FS content', () => {
  const randomBytes = new Uint8Array(Array.from({ length: 16 }, (_, k) => k + 1));
  const goodMediaTypeString = 'text/plain';
  const goodMediaTypeBytes = new TextEncoder().encode(goodMediaTypeString);

  it('Throws if no media type NUL terminator found', () => {
    expect(() => parseFsContent(randomBytes)).toThrow('No NUL byte');
  });

  it('Parses supported serialized FS content', () => {
    const version = 1;
    const object = new Uint8Array([version, ...goodMediaTypeBytes, 0, ...randomBytes]);
    const [v, m, p] = parseFsContent(object);
    expect(v).toBe(version);
    expect(m).toBe(goodMediaTypeString);
    expect(p).toEqual(randomBytes);
  });

  it('Throws if an unknown version if encountered', () => {
    const object = new Uint8Array([2, ...goodMediaTypeBytes, 0, ...randomBytes]);
    expect(() => parseFsContent(object)).toThrow('Unsupported FS version');
  });

  it('Throws if a bad media type is encountered', () => {
    const object = new Uint8Array([1, ...randomBytes, 0, ...randomBytes]);
    expect(() => parseFsContent(object)).toThrow('Bad media type');
  });

  it('Skips validation with trusted mode enabled', () => {
    const version = 2;
    const object = new Uint8Array([version, ...goodMediaTypeBytes, 0, ...randomBytes]);
    const [v, m, p] = parseFsContent(object, true);
    expect(v).toBe(version);
    expect(m).toBe(goodMediaTypeString);
    expect(p).toEqual(randomBytes);
  });
});
