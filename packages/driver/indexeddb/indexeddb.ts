import type { ChannelDriver } from '@librebase/core';

/** Configuration object for the IndexedDB channel driver. */
export interface IndexedDbChannelOptions {
  databaseName?: string;
  addressTableName?: string;
  objectTableName?: string;
}

/**
 * Creates an IndexedDB channel driver.
 *
 * @param {IndexedDbChannelOptions} [config] An optional configuration object.
 * @returns {Promise<ChannelDriver>} A promise that resolves with the `Channel` interface once the
 *   indexedDB connection has been established.
 */
export async function indexeddb(config?: IndexedDbChannelOptions): Promise<IndexedDB> {
  const databaseName = config?.databaseName ?? 'lbdata';
  const addressTableName = config?.addressTableName ?? 'address';
  const objectTableName = config?.objectTableName ?? 'object';
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(addressTableName, { keyPath: 'address' });
      request.result.createObjectStore(objectTableName, { keyPath: 'hash' });
    };
  });
  return new IndexedDB(db, databaseName, addressTableName, objectTableName);
}

class IndexedDB implements ChannelDriver {
  constructor(
    private readonly db: IDBDatabase,
    readonly databaseName: string,
    readonly addressTableName: string,
    readonly objectTableName: string,
  ) {}

  private delete(store: string, key: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.db.transaction(store, 'readwrite').objectStore(store).delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private get<T>(store: string, key: IDBValidKey): Promise<T | void> {
    return new Promise((resolve, reject) => {
      const request = this.db.transaction(store, 'readonly').objectStore(store).get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as T);
    });
  }

  private put(store: string, value: unknown): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.db.transaction(store, 'readwrite').objectStore(store).put(value);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  deleteObject(hash: ArrayBuffer): Promise<void> {
    return this.delete(this.objectTableName, hash);
  }

  async getObject(hash: ArrayBuffer): Promise<ArrayBuffer | void> {
    const result = await this.get<{
      hash: ArrayBuffer;
      object: ArrayBuffer;
    }>(this.objectTableName, hash);
    return result?.object;
  }

  putObject(hash: ArrayBuffer, object: ArrayBuffer): Promise<void> {
    return this.put(this.objectTableName, { hash, object });
  }

  async getAddressHash(address: ArrayBuffer): Promise<ArrayBuffer | void> {
    const result = await this.get<{
      address: ArrayBuffer;
      hash: ArrayBuffer;
    }>(this.addressTableName, address);
    return result?.hash;
  }

  setAddressHash(address: ArrayBuffer, hash: ArrayBuffer): Promise<void> {
    return this.put(this.addressTableName, { address, hash });
  }

  unsetAddressHash(address: ArrayBuffer): Promise<void> {
    return this.delete(this.addressTableName, address);
  }
}
