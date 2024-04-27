import type { Channels } from './channels';
import type { ChannelDriver } from './types';

export type Query<T> = (channel: ChannelDriver) => T | Promise<T>;

/** Queries all channels asynchronously. */
export function queryChannelsAsync<T>(
  channels: Channels,
  query: Query<T>,
): Promise<PromiseSettledResult<Awaited<T>>[]> {
  const promises: Promise<T>[] = [];
  processOne(promises, channels, query);
  return Promise.allSettled(promises);
}

function processOne<T>(
  promises: Promise<T>[],
  value: ChannelDriver | Channels,
  query: Query<T>,
): void {
  if (value instanceof Array) {
    for (const channel of value) {
      processOne(promises, channel, query);
    }
  } else {
    promises.push(Promise.resolve(query(value)));
  }
}
