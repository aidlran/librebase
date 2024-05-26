import { Identifier } from '@librebase/core';
import 'fake-indexeddb/auto';
import { expect, test } from 'vitest';
import { indexeddb } from './indexeddb';

test('IndexedDB channel driver', async () => {
  const channel = await indexeddb();
  const hash = new Identifier(crypto.getRandomValues(new Uint8Array(16)));
  const object = crypto.getRandomValues(new Uint8Array(64));
  await expect(channel.get(hash)).resolves.toBeUndefined();
  await expect(channel.put(hash, object)).resolves.toBeUndefined();
  await expect(channel.get(hash)).resolves.toEqual(object);
  await expect(channel.delete(hash)).resolves.toBeUndefined();
  await expect(channel.get(hash)).resolves.toBeUndefined();
});

test.todo('Multiple instances with different database or table names');
