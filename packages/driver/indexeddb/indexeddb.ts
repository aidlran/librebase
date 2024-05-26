import type { ChannelDriver } from '@librebase/core';

/** Configuration object for the IndexedDB channel driver. */
export interface IndexedDbChannelOptions {
  /**
   * The IndexedDB database name.
   *
   * @default 'librebase'
   */
  databaseName?: string;
  /**
   * The IndexedDB table name.
   *
   * @default 'librebase'
   */
  tableName?: string;
}

/**
 * Creates an IndexedDB {@linkcode ChannelDriver}.
 *
 * @param {IndexedDbChannelOptions} [config] An optional configuration object.
 * @returns {Promise<ChannelDriver>} A promise that resolves with the `Channel` interface once the
 *   indexedDB connection has been established.
 */
export async function indexeddb(config?: IndexedDbChannelOptions): Promise<IndexedDB> {
  const databaseName = config?.databaseName ?? 'librebase';
  const tableName = config?.tableName ?? 'librebase';
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(tableName, { keyPath: 'id' });
    };
  });
  return new IndexedDB(db, databaseName, tableName);
}

class IndexedDB implements ChannelDriver {
  constructor(
    /** @ignore */
    private readonly db: IDBDatabase,
    /** The IndexedDB database name. */
    readonly databaseName: string,
    /** The IndexedDB table name. */
    readonly tableName: string,
  ) {}

  delete(id: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.db
        .transaction(this.tableName, 'readwrite')
        .objectStore(this.tableName)
        .delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  get<T>(id: ArrayBuffer): Promise<T | void> {
    return new Promise((resolve, reject) => {
      const request = this.db
        .transaction(this.tableName, 'readonly')
        .objectStore(this.tableName)
        .get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve((request.result as { value: T })?.value);
    });
  }

  put(id: ArrayBuffer, value: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.db
        .transaction(this.tableName, 'readwrite')
        .objectStore(this.tableName)
        .put({ id, value });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export type { IndexedDB };
