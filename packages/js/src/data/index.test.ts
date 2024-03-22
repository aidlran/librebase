import { describe, expect, it } from 'vitest';
import { createNode, getNode } from '.';

describe('createNode (public API)', () => {
  it('is a function', () => {
    expect(createNode).toBeTypeOf('function');
  });

  it('invokes correctly', () => {
    expect(createNode()).toBeTypeOf('object');
  });
});

describe('getNode (public API)', () => {
  it('is a function', () => {
    expect(getNode).toBeTypeOf('function');
  });

  it('invokes correctly', () => {
    expect(getNode(new Uint8Array())).rejects.toThrowError('No channels registered');
  });
});
