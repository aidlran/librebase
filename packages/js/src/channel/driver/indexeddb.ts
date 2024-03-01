import { registerObjectStore } from '../../indexeddb/indexeddb';
import type { ChannelDriver, SerializedNodeData } from '../types';

registerObjectStore('address', { keyPath: 'address' });
registerObjectStore('data', { keyPath: 'hash' });

function deleteNode(_hash: Uint8Array) {
  // TODO(feat)
  throw new Error('Not implemented');
}

function getNode(_hash: Uint8Array) {
  // TODO(feat)
  throw new Error('Not implemented');
}

function putNode(_node: SerializedNodeData) {
  // TODO(feat)
  throw new Error('Not implemented');
}

function getAddressedNodeHash(_address: Uint8Array) {
  // TODO(feat)
  throw new Error('Not implemented');
}

function setAddressedNodeHash(_address: Uint8Array, _hash: Uint8Array) {
  // TODO(feat)
  throw new Error('Not implemented');
}

function unsetAddressedNode(_address: Uint8Array) {
  // TODO(feat)
  throw new Error('Not implemented');
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
