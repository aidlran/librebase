import { describe, expect, it } from 'vitest';
import 'fake-indexeddb/auto';
import { indexeddb } from './indexeddb';

describe('IndexedDB channel driver', () => {
  it('Constructs a channel interface', async () => {
    const channel = await indexeddb();
    expect(channel).toBeTypeOf('object');
    expect(channel.deleteObject).toBeTypeOf('function');
    expect(channel.getAddressHash).toBeTypeOf('function');
    expect(channel.getObject).toBeTypeOf('function');
    expect(channel.putObject).toBeTypeOf('function');
    expect(channel.setAddressHash).toBeTypeOf('function');
    expect(channel.unsetAddressHash).toBeTypeOf('function');
  });
});
