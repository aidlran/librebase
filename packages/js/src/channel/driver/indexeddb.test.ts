import 'fake-indexeddb/auto';
import { describe, expect, test } from 'vitest';
import { indexeddb } from './indexeddb';

describe('IndexedDB channel driver', async () => {
  const channel = await indexeddb();
  const hash = crypto.getRandomValues(new Uint8Array(16));

  test('Object CRUD', async () => {
    const object = crypto.getRandomValues(new Uint8Array(64));
    await expect(channel.getObject(hash)).resolves.toBeUndefined();
    await expect(channel.putObject(hash, object)).resolves.toBeUndefined();
    await expect(channel.getObject(hash)).resolves.toEqual(object);
    await expect(channel.deleteObject(hash)).resolves.toBeUndefined();
    await expect(channel.getObject(hash)).resolves.toBeUndefined();
  });

  test('Address CRUD', async () => {
    const address = crypto.getRandomValues(new Uint8Array(16));
    await expect(channel.getAddressHash(address)).resolves.toBeUndefined();
    await expect(channel.setAddressHash(address, hash)).resolves.toBeUndefined();
    await expect(channel.getAddressHash(address)).resolves.toEqual(hash);
    await expect(channel.unsetAddressHash(address)).resolves.toBeUndefined();
    await expect(channel.getAddressHash(address)).resolves.toBeUndefined();
  });
});

test.todo('Multiple instances with different database or table names');
