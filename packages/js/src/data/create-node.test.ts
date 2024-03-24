import { beforeEach, describe, expect, it } from 'vitest';
import { HashAlgorithm } from '../crypto/hash/algorithm';
import { getModule } from '../modules/modules';
import { createNode as createNodeFn, type Node } from './create-node';

describe('createNode (module)', () => {
  const createNode = getModule(createNodeFn);

  it('is a function module', () => {
    expect(createNode).toBeTypeOf('function');
  });

  describe('returned API', () => {
    let node: Node;
    beforeEach(() => {
      node = createNode();
    });

    it('is constructed', () => {
      expect(node).toBeTypeOf('object');
    });

    it('has expected number of properties', () => {
      expect(Object.keys(node)).toHaveLength(12);
    });

    describe('hashAlg', () => {
      it('is a function', () => {
        expect(node.hashAlg).toBeTypeOf('function');
      });

      it('returns a hash algorithm identifier', () => {
        expect(Object.values(HashAlgorithm).includes(node.hashAlg())).toBe(true);
      });
    });

    describe('setHashAlg', () => {
      it('is a function', () => {
        expect(node.setHashAlg).toBeTypeOf('function');
      });

      it('uses method chaining', () => {
        expect(node.setHashAlg(0)).toBe(node);
      });
    });

    describe('mediaType', () => {
      it('is a function', () => {
        expect(node.mediaType).toBeTypeOf('function');
      });

      it('returns a media type', () => {
        node.setMediaType('text/plain');
        expect(node.mediaType()).toEqual({ type: 'text/plain', parameters: {} });
      });
    });

    describe('setMediaType', () => {
      // createNode only creates and connects the signal.
      // More tests live in the media type signal test suite.

      it('is a function', () => {
        expect(node.setMediaType).toBeTypeOf('function');
      });

      it('uses method chaining', () => {
        expect(node.setMediaType('text/plain')).toBe(node);
      });
    });

    describe('value', () => {
      it('is a function', () => {
        expect(node.value).toBeTypeOf('function');
      });

      it('returns the value', () => {
        node.setValue('test');
        expect(node.value()).toBe('test');
      });
    });

    describe('setValue', () => {
      it('is a function', () => {
        expect(node.setValue).toBeTypeOf('function');
      });

      it('uses method chaining', () => {
        expect(node.setValue({})).toBe(node);
      });
    });

    describe('payload', () => {
      it('is a function', () => {
        expect(node.payload).toBeTypeOf('function');
      });

      it('returns a byte array', () => {
        node.setMediaType('text/plain').setValue('test');
        expect(node.payload()).resolves.toBeInstanceOf(Uint8Array);
      });

      it.todo('wraps and returns a byte array');
    });

    describe('setPayload', () => {
      it('is a function', () => {
        expect(node.setPayload).toBeTypeOf('function');
      });

      it('uses method chaining', () => {
        expect(node.setPayload(new Uint8Array())).resolves.toBe(node);
      });
    });

    describe('popWrapper', () => {
      it('is a function', () => {
        expect(node.popWrapper).toBeTypeOf('function');
      });

      it('uses method chaining', () => {
        expect(node.popWrapper()).toBe(node);
      });
    });

    describe('pushWrapper', () => {
      it('is a function', () => {
        expect(node.pushWrapper).toBeTypeOf('function');
      });

      it('uses method chaining', () => {
        expect(node.pushWrapper({ type: 0, metadata: new Uint8Array() })).toBe(node);
      });
    });

    describe('hash', () => {
      it('is a function', () => {
        expect(node.hash).toBeTypeOf('function');
      });

      it('returns Promise<Uint8Array>', () => {
        const hash = node.setMediaType('text/plain').setValue('test').hash();
        expect(hash).toBeInstanceOf(Promise);
        expect(hash).resolves.toBeInstanceOf(Uint8Array);
      });
    });

    describe('push', () => {
      it('is a function', () => {
        expect(node.push).toBeTypeOf('function');
      });

      it('returns Promise<Node>', () => {
        const pushed = node.setMediaType('text/plain').setValue('test').push();
        expect(pushed).toBeInstanceOf(Promise);
        expect(pushed).resolves.toBe(node);
      });
    });
  });
});
