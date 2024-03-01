import { deleteObject, getObject, putObject, registerObjectStore } from '../../indexeddb/indexeddb';
import type { ChannelDriver, SerializedNodeData } from '../types';

registerObjectStore('address', { keyPath: 'address' });
registerObjectStore('data', { keyPath: 'hash' });

function deleteNode(hash: Uint8Array) {
  return deleteObject('data', hash);
}

async function getNode(hash: Uint8Array) {
  const data = await getObject<SerializedNodeData>('data', hash);
  return [data.mediaType, data.payload] as [string, Uint8Array];
}

async function putNode(node: SerializedNodeData) {
  await putObject('data', node);
}

async function getAddressedNodeHash(address: Uint8Array) {
  const data = await getObject<{ address: Uint8Array; hash: Uint8Array }>('address', address);
  return data.hash;
}

function setAddressedNodeHash(address: Uint8Array, hash: Uint8Array) {
  return putObject('address', { address, hash });
}

function unsetAddressedNode(address: Uint8Array) {
  return deleteObject('address', address);
}

/**
 * The configured interface. We don't expose this directly - instead we expose the below function.
 * This allows us to add configuration params in the future without introducing breaking changes.
 */
const driver: ChannelDriver = {
  deleteNode,
  getNode,
  putNode,
  getAddressedNodeHash,
  setAddressedNodeHash,
  unsetAddressedNode,
};

/** @returns A `ChannelDriver` interface for local indexedDB. */
export function indexedDBDriver() {
  return driver;
}
