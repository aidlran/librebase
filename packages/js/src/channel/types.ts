export type MaybePromise<T> = T | Promise<T>;
export type GetResult<T> = MaybePromise<T | void>;

/** Interface for a channel implementation. */
export interface ChannelDriver {
  deleteObject?(hash: ArrayBuffer): MaybePromise<void>;
  getObject?(hash: ArrayBuffer): GetResult<ArrayBuffer>;
  putObject?(hash: ArrayBuffer, object: ArrayBuffer): MaybePromise<void>;
  getAddressHash?(address: ArrayBuffer): GetResult<ArrayBuffer>;
  setAddressHash?(address: ArrayBuffer, hash: ArrayBuffer): MaybePromise<void>;
  unsetAddressHash?(address: ArrayBuffer): MaybePromise<void>;
}
