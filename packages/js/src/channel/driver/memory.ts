import { textDecoder } from '../shared';
import type { ChannelDriver, SerializedNodeData } from '../types';

/** An in-memory driver for testing and development. */
export class MemoryDriver implements ChannelDriver {
  private readonly data: Record<string, [string, Uint8Array]> = {};
  private readonly named: Record<string, Uint8Array> = {};

  deleteNode(hash: Uint8Array) {
    delete this.data[textDecoder.decode(hash)];
  }

  getNode(hash: Uint8Array) {
    return this.data[textDecoder.decode(hash)];
  }

  putNode({ hash, mediaType, payload }: SerializedNodeData) {
    this.data[textDecoder.decode(hash)] = [mediaType, payload];
  }

  unsetAddressedNode(name: string) {
    delete this.named[name];
  }

  getAddressedNodeHash(name: string) {
    return this.named[name];
  }

  setAddressedNodeHash(name: string, hash: Uint8Array) {
    this.named[name] = hash;
  }
}
