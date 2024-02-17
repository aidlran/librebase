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

  unsetAddressedNode(name: string) {
    localStorage.removeItem(name);
  }

  getAddressedNodeHash(name: string) {
    try {
      const encodedHash = localStorage.getItem(name);
      if (encodedHash) {
        return textEncoder.encode(encodedHash);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(error);
    }
  }

  setAddressedNodeHash(name: string, hash: Uint8Array) {
    localStorage.setItem(name, textDecoder.decode(hash));
  }
}
