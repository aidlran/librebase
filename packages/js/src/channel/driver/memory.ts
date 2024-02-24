import { textDecoder } from '../../shared';
import type { ChannelDriver, SerializedNodeData } from '../types';

/** An in-memory driver for testing and development. */
export class MemoryDriver implements ChannelDriver {
  private readonly data: Record<string, [string, Uint8Array]> = {};
  private readonly addresses: Record<string, Uint8Array> = {};

  deleteNode(hash: Uint8Array) {
    delete this.data[textDecoder.decode(hash)];
  }

  getNode(hash: Uint8Array) {
    return this.data[textDecoder.decode(hash)];
  }

  putNode({ hash, mediaType, payload }: SerializedNodeData) {
    this.data[textDecoder.decode(hash)] = [mediaType, payload];
  }

  unsetAddressedNode(address: Uint8Array) {
    delete this.addresses[textDecoder.decode(address)];
  }

  getAddressedNodeHash(address: Uint8Array) {
    return this.addresses[textDecoder.decode(address)];
  }

  setAddressedNodeHash(address: Uint8Array, hash: Uint8Array) {
    this.addresses[textDecoder.decode(address)] = hash;
  }
}
