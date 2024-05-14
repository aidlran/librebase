import { getModule } from '../modules/modules';
import { state } from '../state';
import type { ChannelDriver } from './types';

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
 */
export type Channels = (ChannelDriver | ChannelDriver[])[];

/**
 * Gets the array of channels registered for the instance. The returned array can be manipulated
 * directly to change the registered channels. See the type definition of `Channels` for more
 * information about how it is used.
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
  return getModule(state, instanceID).channels;
}
