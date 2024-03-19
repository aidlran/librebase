import type { ChannelDriver, GetResult, RetrievedNodeData, SerializedNodeData } from './types';

export interface ChannelModule {
  getNode<T>(
    hash: Uint8Array,
    validator: (data: RetrievedNodeData) => Promise<T | void>,
  ): Promise<T | void>;
  putNode(data: SerializedNodeData): Promise<void>;
  getAddressedNodeHash<T>(
    address: Uint8Array,
    validator: (hash: Uint8Array) => Promise<T | void>,
  ): Promise<T | void>;
  setAddressedNodeHash(address: Uint8Array, hash: Uint8Array): Promise<void>;
  registerDriver(driver: ChannelDriver): void;
  unregisterDriver(driver: ChannelDriver): void;
}

function race<T, R>(
  channels: Set<ChannelDriver>,
  query: (channel: ChannelDriver) => GetResult<T>,
  validator: (data: T) => Promise<R | void>,
) {
  return new Promise<R | void>((resolve) => {
    let resolved = false;
    let todo = channels.size;
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
}

function awaitAll(channels: Set<ChannelDriver>, fn: (channel: ChannelDriver) => unknown) {
  return Promise.allSettled([...channels].map(fn));
}

export function channelModule(): ChannelModule {
  const channels = new Set<ChannelDriver>();
  return {
    getNode(hash, validator) {
      return race(channels, (channel) => channel.getNode(hash), validator);
    },
    async putNode(data) {
      await awaitAll(channels, (channel) => channel.putNode(data));
    },
    getAddressedNodeHash(address, validator) {
      return race(channels, (channel) => channel.getAddressedNodeHash(address), validator);
    },
    async setAddressedNodeHash(address, hash) {
      await Promise.allSettled(
        [...channels].map((channel) => channel.setAddressedNodeHash(address, hash)),
      );
    },
    registerDriver(driver) {
      channels.add(driver);
    },
    unregisterDriver(driver) {
      channels.delete(driver);
    },
  };
}
