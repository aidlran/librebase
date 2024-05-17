export type MaybePromise<T> = T | Promise<T>;

/** Interface for a channel implementation. */
export interface ChannelDriver {
  delete?(id: ArrayBuffer): MaybePromise<void>;
  get?(id: ArrayBuffer): MaybePromise<ArrayBuffer | void>;
  put?(id: ArrayBuffer, value: ArrayBuffer): MaybePromise<void>;
}
