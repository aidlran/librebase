import { deleteRecord, getRecord, open, putRecord } from '../../indexeddb/indexeddb';
import type { ChannelDriver } from '../types';

/** Configuration object for the IndexedDB channel driver. */
export interface IndexedDbChannelOptions {
  databaseName?: string;
  addressTableName?: string;
  objectTableName?: string;
}

interface AddressTableEntry {
  address: ArrayBuffer;
  hash: ArrayBuffer;
}

interface ObjectTableEntry {
  hash: ArrayBuffer;
  object: ArrayBuffer;
}

/**
 * Creates an IndexedDB channel.
 *
 * @param {IndexedDbChannelOptions} [config] An optional configuration object.
 * @returns {Promise<ChannelDriver>} A promise that resolves with the `Channel` interface once the
 *   indexedDB connection has been established.
 */
export async function indexeddb(config?: IndexedDbChannelOptions): Promise<IndexedDB> {
  const databaseName = config?.databaseName ?? 'lbdata';
  const addressTableName = config?.addressTableName ?? 'address';
  const objectTableName = config?.objectTableName ?? 'object';
  await open(
    databaseName,
    [
      [addressTableName, { keyPath: 'address' }],
      [objectTableName, { keyPath: 'hash' }],
    ],
    1,
  );
  return new IndexedDB(databaseName, addressTableName, objectTableName);
}

class IndexedDB implements Required<ChannelDriver> {
  constructor(
    readonly databaseName: string,
    readonly addressTableName: string,
    readonly objectTableName: string,
  ) {}

  deleteObject(hash: ArrayBuffer): Promise<void> {
    return deleteRecord(this.databaseName, this.objectTableName, hash);
  }

  async getObject(hash: ArrayBuffer): Promise<ArrayBuffer | void> {
    const record = await getRecord<ObjectTableEntry>(this.databaseName, this.objectTableName, hash);
    if (record?.object) return record.object;
  }

  async putObject(hash: ArrayBuffer, object: ArrayBuffer): Promise<void> {
    await putRecord(this.databaseName, this.objectTableName, { hash, object });
  }

  async getAddressHash(address: ArrayBuffer): Promise<ArrayBuffer | void> {
    const record = await getRecord<AddressTableEntry>(
      this.databaseName,
      this.addressTableName,
      address,
    );
    if (record?.hash) return record.hash;
  }

  async setAddressHash(address: ArrayBuffer, hash: ArrayBuffer): Promise<void> {
    await putRecord(this.databaseName, this.addressTableName, { address, hash });
  }

  unsetAddressHash(address: ArrayBuffer): Promise<void> {
    return deleteRecord(this.databaseName, this.addressTableName, address);
  }
}
