/**
 * Asfafaf
 *
 * @module Channels
 * @category API Reference
 */

import { Identifier } from '../identifiers/identifiers.js';
import type { MaybePromise } from '../internal/index.js';

/** Interface for a channel implementation. All functionality is optional to implement. */
export interface ChannelDriver {
  /**
   * A function that handles a delete request.
   *
   * @param id The identifier of the value requested to be deleted.
   * @returns `void`, but if the function is asynchronous it should return a promise that resolves
   *   once the action has been completed.
   */
  delete?(id: Identifier): MaybePromise<void>;
  /**
   * A function that handles a get request.
   *
   * @param id The identifier of the requested value.
   * @returns The value or a promise that resolves with the value. If the value cannot be retrieved
   *   becuase it doesn't exist or for some other reason, we should return `void` instead.
   */
  get?(id: Identifier): MaybePromise<ArrayLike<number> | ArrayBufferLike | void>;
  /**
   * A function that handles a put request (to store an identifier/value pair).
   *
   * @param id The identifier.
   * @param value The value.
   * @returns `void`, but if the function is asynchronous it should return a promise that resolves
   *   once the action has been completed.
   */
  put?(id: Identifier, value: Uint8Array): MaybePromise<void>;
}

/**
 * An array containing the channels registered for an instance.
 *
 * While querying for objects, each entry in the array is queried one by one until a valid result is
 * returned or until the end of the array is reached. Each entry can be either a single
 * {@linkcode ChannelDriver}, or a subarray of many channels. When a subarray is encountered, each
 * channel in the subarray is queried asynchronously and raced for the first valid result.
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
 */
export type Channels = (ChannelDriver | ChannelDriver[])[];

/**
 * A query function that is called per item.
 *
 * @template T The type of the item.
 * @template R The type of the return value.
 * @param item One of the items to query.
 * @returns A value or a promise that resolves to a value.
 */
export type ChannelQuery<T, R> = (item: T) => MaybePromise<R>;

const channels: Record<string, Channels> = {};

/**
 * Gets the array of channels registered for the instance. The returned array can be manipulated
 * directly to change the registered channels. See also the {@linkcode Channels} typedef.
 *
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

/** Queries channels synchronously, one by one. Groups of channels are raced asynchronously. */
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

/** Queries all channels asynchronously. */
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
