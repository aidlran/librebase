import 'fake-indexeddb/auto';
import { describe, expect, it, test } from 'vitest';
import { deleteObject, getAllObjects, getObject, open, putObject } from './indexeddb';

describe('IndexedDB', () => {
  test('open', () => {
    expect(open('open-test', [['store', { keyPath: 'id' }]])).resolves.toBe(undefined);
  });

  it('throws when database not open', () => {
    expect(deleteObject('unopened', 'store', 0)).rejects.toThrow(ReferenceError);
    expect(getObject('unopened', 'store', 0)).rejects.toThrow(ReferenceError);
    expect(getAllObjects('unopened', 'store')).rejects.toThrow(ReferenceError);
    expect(putObject('unopened', 'store', { id: 0 })).rejects.toThrow(ReferenceError);
  });

  test('CRUD', async () => {
    await open('crud', [['store', { keyPath: 'id' }]]);
    await putObject('crud', 'store', { id: 8 });
    await expect(getObject('crud', 'store', 8)).resolves.toEqual({ id: 8 });
    await putObject('crud', 'store', { id: 9 });
    await expect(getAllObjects('crud', 'store')).resolves.toEqual([{ id: 8 }, { id: 9 }]);
    await putObject('crud', 'store', { id: 8, test: 'test' });
    await expect(getObject('crud', 'store', 8)).resolves.toEqual({ id: 8, test: 'test' });
    await expect(deleteObject('crud', 'store', 8)).resolves.toBe(undefined);
    await expect(getObject('crud', 'store', 8)).resolves.toBe(undefined);
  });

  test('delete ignores non-existing', async () => {
    await open('delete', [['store', { keyPath: 'id' }]]);
    await expect(deleteObject('delete', 'store', 99)).resolves.toBe(undefined);
  });
});
