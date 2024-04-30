import { getModule } from '../modules/modules';
import { channels } from './channels';
import type { Query } from './query-async';
import type { ChannelDriver } from './types';

/** Queries channels synchronously, one by one. Groups of channels are raced asynchronously. */
export async function queryChannelsSync<T>(
  query: Query<ChannelDriver, T>,
  instanceID?: string,
): Promise<T | void> {
  for (const entry of getModule(channels, instanceID)) {
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
function race<T, R>(channels: T[], query: Query<T, R>): Promise<R | void> {
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
