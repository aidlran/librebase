/** @category Channels */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Interface for a channel implementation.
 *
 * @category Channels
 */
export interface ChannelDriver {
  delete?(id: ArrayBuffer): MaybePromise<void>;
  get?(id: ArrayBuffer): MaybePromise<ArrayBuffer | void>;
  put?(id: ArrayBuffer, value: ArrayBuffer): MaybePromise<void>;
}

/**
 * An array containing the channels registered for an instance.
 *
 * While querying for objects, each entry in the array is queried one by one until a valid result is
 * returned or until the end of the array is reached. Each entry can be either a single
 * `ChannelDriver` instance, or a subarray of `ChannelDriver` instances. When a subarray is
 * encountered, each channel in the subarray is queried asynchronously and raced for the first valid
 * result.
 *
 * This allows control over when channels are queried. A typical set up would be to query local
 * sources followed by remote sources, as demonstated in the theoretical example below.
 *
 * ```ts
 * const channels: Channels = [
 *   [memory, indexeddb],
 *   [remoteSource1, remoteSource2],
 * ];
 * ```
 *
 * @category Channels
 */
export type Channels = (ChannelDriver | ChannelDriver[])[];

/** @category Channels */
export type ChannelQuery<T, R> = (item: T) => R | Promise<R>;

const channels: Record<string, Channels> = {};

/**
 * Gets the array of channels registered for the instance. The returned array can be manipulated
 * directly to change the registered channels. See the type definition of `Channels` for more
 * information about how it is used.
 *
 * @category Channels
 * @example Push to the array to register new channels:
 *
 * ```js
 * const channels = getChannels();
 * channels.push([memory, indexeddb], [remoteSource1, remoteSource2]);
 * ```
 *
 * @param {string} [instanceID] The ID of the instance. Omit to use the default instance.
 * @returns {Channels} An array containing the channels registered for an instance.
 */
export function getChannels(instanceID?: string): Channels {
  return (channels[instanceID ?? ''] ??= []);
}

/**
 * Queries channels synchronously, one by one. Groups of channels are raced asynchronously.
 *
 * @category Channels
 */
export async function queryChannelsSync<T>(
  query: ChannelQuery<ChannelDriver, T>,
  instanceID?: string,
): Promise<T | void> {
  for (const entry of getChannels(instanceID)) {
    const result = await race(entry instanceof Array ? entry : [entry], query);
    if (result !== undefined && result !== null) {
      return result;
    }
  }
}

/**
 * Queries all channels asynchronously and returns the first valid result as it comes in. Any that
 * return `null` or `undefined` or any that throw are ignored. If none return a valid result, the
 * resolved value is `undefined`.
 */
function race<T, R>(channels: T[], query: ChannelQuery<T, R>): Promise<R | void> {
  return new Promise((resolve) => {
    let todo = channels.length;
    let resolved = false;
    if (!todo) {
      handleNull();
    }
    for (const channel of channels) {
      try {
        void Promise.resolve(query(channel))
          .then((data) => {
            if (!resolved) {
              if (data === undefined || data === null) {
                handleNull();
              } else {
                resolved = true;
                resolve(data);
              }
            }
          })
          .catch(handleNull);
      } catch (e) {
        handleNull();
      }
    }
    function handleNull() {
      if (!resolved) {
        if (todo <= 1) resolve();
        else todo--;
      }
    }
  });
}

/**
 * Queries all channels asynchronously.
 *
 * @category Channels
 */
export function queryChannelsAsync<T>(
  query: ChannelQuery<ChannelDriver, T>,
  instanceID?: string,
): Promise<PromiseSettledResult<Awaited<T>>[]> {
  const promises: Promise<T>[] = [];
  processOne(promises, getChannels(instanceID), query);
  return Promise.allSettled(promises);
}

function processOne<T>(
  promises: Promise<T>[],
  value: ChannelDriver | Channels,
  query: ChannelQuery<ChannelDriver, T>,
): void {
  if (value instanceof Array) {
    for (const channel of value) {
      processOne(promises, channel, query);
    }
  } else {
    promises.push(Promise.resolve(query(value)));
  }
}
