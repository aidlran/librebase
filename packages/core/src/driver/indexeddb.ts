import type { ChannelDriver, Identifier } from '../public/index.js';

/** Configuration object for the IndexedDB channel driver. */
export interface IndexedDbChannelOptions {
  /**
   * The IndexedDB database name.
   *
   * @default 'astrobase'
   */
  databaseName?: string;
  /**
   * The IndexedDB table name.
   *
   * @default 'astrobase'
   */
  tableName?: string;
}

/**
 * Creates an IndexedDB {@linkcode ChannelDriver}.
 *
 * ## Usage
 *
 * ```js
 * import { getChannels } from '@astrobase/core';
 * import { indexeddb } from '@astrobase/core/driver';
 *
 * indexeddb().then((driver) => {
 *   getChannels().push(driver);
 * });
 * ```
 *
 * Note that this function returns a promise. Once awaited, the database connection is initiated and
 * a {@linkcode ChannelDriver} is resolved, which can be registered.
 *
 * @param {IndexedDbChannelOptions} [config] An optional configuration object.
 * @returns {Promise<ChannelDriver>} A promise that resolves with the `Channel` interface once the
 *   indexedDB connection has been established.
 */
export async function indexeddb(config?: IndexedDbChannelOptions): Promise<IndexeddbDriver> {
  const databaseName = config?.databaseName ?? 'astrobase';
  const tableName = config?.tableName ?? 'astrobase';
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(tableName, { keyPath: 'id' });
    };
  });
  return new IndexeddbDriver(db, databaseName, tableName);
}

export class IndexeddbDriver implements ChannelDriver {
  constructor(
    /** @ignore */
    private readonly db: IDBDatabase,
    /** The IndexedDB database name. */
    readonly databaseName: string,
    /** The IndexedDB table name. */
    readonly tableName: string,
  ) {}

  delete(id: Identifier): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.db
        .transaction(this.tableName, 'readwrite')
        .objectStore(this.tableName)
        .delete(id.bytes);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  get<T>(id: Identifier): Promise<T | void> {
    return new Promise((resolve, reject) => {
      const request = this.db
        .transaction(this.tableName, 'readonly')
        .objectStore(this.tableName)
        .get(id.bytes);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve((request.result as { value: T })?.value);
    });
  }

  put(id: Identifier, value: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.db
        .transaction(this.tableName, 'readwrite')
        .objectStore(this.tableName)
        .put({ id: id.bytes, value });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
