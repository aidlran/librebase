import { deleteObject, getObject, open, putObject } from '../../indexeddb/indexeddb';
import type { ChannelDriver, RetrievedNodeData, SerializedNodeData } from '../types';

/**
 * @param {string} [dbName] The name of the IndexedDB database to use.
 * @returns A `ChannelDriver` interface for local indexedDB.
 */
export async function indexedDBDriver(dbName = 'lbdata'): Promise<ChannelDriver> {
  await open(
    dbName,
    [
      ['address', { keyPath: 'address' }],
      ['data', { keyPath: 'hash' }],
    ],
    1,
  );
  return {
    deleteNode: deleteNode.bind(dbName),
    getNode: getNode.bind(dbName),
    putNode: putNode.bind(dbName),
    getAddressedNodeHash: getAddressedNodeHash.bind(dbName),
    setAddressedNodeHash: setAddressedNodeHash.bind(dbName),
    unsetAddressedNode: unsetAddressedNode.bind(dbName),
  };
}

function deleteNode(this: string, hash: Uint8Array) {
  return deleteObject(this, 'data', hash);
}

async function getNode(this: string, hash: Uint8Array) {
  const data = await getObject<SerializedNodeData>(this, 'data', hash);
  if (!data) return;
  return [data.mediaType, data.payload] as RetrievedNodeData;
}

async function putNode(this: string, node: SerializedNodeData) {
  await putObject(this, 'data', node);
}

async function getAddressedNodeHash(this: string, address: Uint8Array) {
  const data = await getObject<{
    address: Uint8Array;
    hash: Uint8Array;
  }>(this, 'address', address);
  return data?.hash;
}

function setAddressedNodeHash(this: string, address: Uint8Array, hash: Uint8Array) {
  return putObject(this, 'address', { address, hash });
}

function unsetAddressedNode(this: string, address: Uint8Array) {
  return deleteObject(this, 'address', address);
}
