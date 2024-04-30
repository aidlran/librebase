import { getModule } from '../modules/modules';
import { channels, type Channels } from './channels';
import type { ChannelDriver } from './types';

export type Query<T, R> = (item: T) => R | Promise<R>;

/** Queries all channels asynchronously. */
export function queryChannelsAsync<T>(
  query: Query<ChannelDriver, T>,
  instanceID?: string,
): Promise<PromiseSettledResult<Awaited<T>>[]> {
  const promises: Promise<T>[] = [];
  processOne(promises, getModule(channels, instanceID), query);
  return Promise.allSettled(promises);
}

function processOne<T>(
  promises: Promise<T>[],
  value: ChannelDriver | Channels,
  query: Query<ChannelDriver, T>,
): void {
  if (value instanceof Array) {
    for (const channel of value) {
      processOne(promises, channel, query);
    }
  } else {
    promises.push(Promise.resolve(query(value)));
  }
}
