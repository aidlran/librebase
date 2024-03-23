import type { Injector } from '../modules/modules';
import { channelSet } from './channel-set';
import type { ChannelDriver, GetResult } from './types';

export function raceChannels(this: Injector) {
  return <T, R>(
    query: (channel: ChannelDriver) => GetResult<T>,
    validator: (data: T) => Promise<R | void>,
  ) => {
    return new Promise<R | void>((resolve) => {
      const channels = this(channelSet);
      let todo = channels.size;
      if (!todo) throw new Error('No channels registered');
      let resolved = false;
      for (const channel of channels) {
        void Promise.resolve(query(channel))
          .then((data) => {
            if (!resolved) {
              if (data) {
                void validator(data).then((validValue) => {
                  if (!resolved) {
                    if (validValue) {
                      resolved = true;
                      resolve(validValue);
                    } else if (todo == 1) resolve();
                    else todo--;
                  }
                });
              } else if (todo == 1) resolve();
              else todo--;
            }
          })
          .catch((error) => {
            if (!resolved) {
              if (todo == 1) resolve();
              else todo--;
            }
            throw error;
          });
      }
    });
  };
}
