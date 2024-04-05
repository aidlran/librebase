import 'fake-indexeddb/auto';
import { describe, expect, it, test } from 'vitest';
import { deleteRecord, getAllRecords, getRecord, open, putRecord } from './indexeddb';

describe('IndexedDB', () => {
  test('open', () => {
    expect(open('open-test', [['store', { keyPath: 'id' }]])).resolves.toBe(undefined);
  });

  it('throws when database not open', () => {
    expect(deleteRecord('unopened', 'store', 0)).rejects.toThrow(ReferenceError);
    expect(getRecord('unopened', 'store', 0)).rejects.toThrow(ReferenceError);
    expect(getAllRecords('unopened', 'store')).rejects.toThrow(ReferenceError);
    expect(putRecord('unopened', 'store', { id: 0 })).rejects.toThrow(ReferenceError);
  });

  test('CRUD', async () => {
    await open('crud', [['store', { keyPath: 'id' }]]);
    await putRecord('crud', 'store', { id: 8 });
    await expect(getRecord('crud', 'store', 8)).resolves.toEqual({ id: 8 });
    await putRecord('crud', 'store', { id: 9 });
    await expect(getAllRecords('crud', 'store')).resolves.toEqual([{ id: 8 }, { id: 9 }]);
    await putRecord('crud', 'store', { id: 8, test: 'test' });
    await expect(getRecord('crud', 'store', 8)).resolves.toEqual({ id: 8, test: 'test' });
    await expect(deleteRecord('crud', 'store', 8)).resolves.toBe(undefined);
    await expect(getRecord('crud', 'store', 8)).resolves.toBe(undefined);
  });

  test('delete ignores non-existing', async () => {
    await open('delete', [['store', { keyPath: 'id' }]]);
    await expect(deleteRecord('delete', 'store', 99)).resolves.toBe(undefined);
  });
});
