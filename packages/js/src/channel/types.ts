type MaybePromise<T> = T | Promise<T>;
type GetResult<T> = MaybePromise<T | null | undefined | void>;

/** Interface for a channel implementation. */
export interface ChannelDriver {
  deleteNode(hash: Uint8Array): MaybePromise<unknown>;
  getNode(hash: Uint8Array): GetResult<[mediaType: string, payload: Uint8Array]>;
  putNode(node: SerializedNodeData): MaybePromise<unknown>;
  getAddressedNodeHash(address: Uint8Array): GetResult<Uint8Array>;
  setAddressedNodeHash(address: Uint8Array, hash: Uint8Array): MaybePromise<unknown>;
  unsetAddressedNode(address: Uint8Array): MaybePromise<unknown>;
}

/**
 * This structure is used when pushing or receiving node data via channel driver. It is up to the
 * driver implementation how the structure is stored, so long as it is retrievable and searchable by
 * hash.
 */
export interface SerializedNodeData {
  /** The media type of the payload. For example: `application/json`. */
  mediaType: string;

  /**
   * The binary hash of the payload. The first byte represents the type of hash used. The remaining
   * bytes are the value of the hash itself and may be of arbitrary length depending on the hashing
   * algorithm used.
   */
  hash: Uint8Array;

  /** The binary data payload. */
  payload: Uint8Array;
}
