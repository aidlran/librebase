import { textDecoder, textEncoder } from '../../shared';
import type { ChannelDriver, SerializedNodeData } from '../types';

/**
 * A naïve implementation of a localStorage driver intended only for testing and development. This
 * will be superceded by an indexedDB driver in the future.
 */
export class LocalStorageDriver implements ChannelDriver {
  deleteNode(hash: Uint8Array) {
    localStorage.removeItem(textDecoder.decode(hash));
  }

  getNode(hash: Uint8Array) {
    try {
      const data = localStorage.getItem(textDecoder.decode(hash));
      if (data) {
        const [mediaType, payload] = JSON.parse(data) as string[];
        return [mediaType, textEncoder.encode(payload)] as [string, Uint8Array];
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(error);
    }
  }

  putNode({ hash, mediaType, payload }: SerializedNodeData) {
    const key = textDecoder.decode(hash);
    const value = JSON.stringify([mediaType, textDecoder.decode(payload)]);
    localStorage.setItem(key, value);
  }

  unsetAddressedNode(address: Uint8Array) {
    localStorage.removeItem(textDecoder.decode(address));
  }

  getAddressedNodeHash(address: Uint8Array) {
    try {
      const encodedHash = localStorage.getItem(textDecoder.decode(address));
      if (encodedHash) {
        return textEncoder.encode(encodedHash);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(error);
    }
  }

  setAddressedNodeHash(address: Uint8Array, hash: Uint8Array) {
    localStorage.setItem(textDecoder.decode(address), textDecoder.decode(hash));
  }
}
