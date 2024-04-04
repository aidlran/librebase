import type { Injector } from '../modules/modules';
import { channelSet } from './channel-set';
import type { ChannelDriver, GetResult } from './types';

/**
 * Module function. Queries all channels asynchronously and returns the first to return a valid
 * result that passes the validator function. Any that return `null` or `undefined` or any that
 * throw are ignored. If none return a valid result, the resolved value is `undefined`.
 */
export function raceChannels(this: Injector) {
  return <T, R>(
    query: (channel: ChannelDriver) => GetResult<T>,
    validator: (data: T) => R | void | Promise<R | void>,
  ) => {
    return new Promise<R | void>((resolve) => {
      const channels = this(channelSet);
      let todo = channels.size;
      if (!todo) throw new Error('No channels registered');
      let resolved = false;
      function handleNull() {
        if (!resolved) {
          if (todo == 1) resolve();
          else todo--;
        }
      }
      for (const channel of channels) {
        try {
          void Promise.resolve(query(channel))
            .then((data) => {
              if (!resolved) {
                if (data !== null && data !== undefined) {
                  void Promise.resolve(validator(data)).then((validValue) => {
                    if (!resolved) {
                      if (validValue !== null && validValue !== undefined) {
                        resolved = true;
                        resolve(validValue);
                      } else handleNull();
                    }
                  });
                } else handleNull();
              }
            })
            .catch(handleNull);
        } catch (e) {
          handleNull();
        }
      }
    });
  };
}
