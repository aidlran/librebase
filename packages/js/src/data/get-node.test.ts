import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { resolveBeforeTimeout } from '../../testing/utils';
import { indexedDBDriver, registerDriver, type RetrievedNodeData } from '../channel';
import { HashAlgorithm } from '../crypto/hash/algorithm';
import { getModule } from '../modules/modules';
import { getNode, parseSerializedNode } from './get-node';
import { createNode } from './create-node';

const testHash = new Uint8Array(Array.from({ length: 32 }));
registerDriver(await indexedDBDriver());

describe('getNode (module)', () => {
  it('is a module function', () => {
    expect(getModule(getNode)).toBeTypeOf('function');
  });

  it('throws if no channels are registered', () => {
    expect(() =>
      resolveBeforeTimeout(getModule(getNode, 'no-channel-test')(testHash), 1000),
    ).rejects.toThrowError('No channels registered');
  });

  it('returns undefined if node not found', () => {
    expect(getModule(getNode)(testHash)).resolves.toBe(undefined);
  });

  it('retrieves an existing node', async () => {
    const hashAlg = HashAlgorithm.SHA256;
    const mediaType = 'text/plain';
    const value = 'Test';

    const createdNode = await getModule(createNode)()
      .setHashAlg(hashAlg)
      .setMediaType(mediaType)
      .setValue(value)
      .push();

    const retrievedNode = await getModule(getNode)(await createdNode.hash());

    expect(retrievedNode?.hashAlg()).toEqual(hashAlg);
    expect(retrievedNode?.mediaType().type).toEqual(mediaType);
    expect(retrievedNode?.value()).toEqual(value);
    expect(retrievedNode?.payload()).toEqual(createdNode.payload());
    expect(await retrievedNode?.hash()).toEqual(await createdNode.hash());
  });
});

describe('parseSerializedNode', () => {
  it('is a module function', () => {
    expect(getModule(parseSerializedNode)).toBeTypeOf('function');
  });

  it('rejects (returns undefined) if hash does not match', () => {
    const retrievedNode: RetrievedNodeData = [
      'application/octet-stream',
      new Uint8Array(Array.from({ length: 8 })),
    ];

    // with different length hash
    expect(
      getModule(parseSerializedNode)(retrievedNode, new Uint8Array(Array.from({ length: 16 }))),
    ).resolves.toBe(undefined);

    // with same length hash
    expect(
      getModule(parseSerializedNode)(retrievedNode, new Uint8Array(Array.from({ length: 33 }))),
    ).resolves.toBe(undefined);
  });

  it('converts a valid serialized data and hash to a node instance', async () => {
    const mediaType = 'text/plain';
    const payload = new Uint8Array([84, 101, 115, 116]);
    const hash = new Uint8Array([
      0, 83, 46, 170, 189, 149, 116, 136, 13, 191, 118, 185, 184, 204, 0, 131, 44, 32, 166, 236, 17,
      61, 104, 34, 153, 85, 13, 122, 110, 15, 52, 94, 37,
    ]);

    const node = await getModule(parseSerializedNode)([mediaType, payload], hash);

    expect(node?.hashAlg()).toEqual(hash[0]);
    expect(node?.mediaType().type).toEqual(mediaType);
    expect(node?.value()).toEqual('Test');
    expect(node?.payload()).toEqual(payload);
    expect(await node?.hash()).toEqual(hash);
  });
});
