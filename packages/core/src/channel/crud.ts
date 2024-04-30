import { queryChannelsAsync } from './query-async';
import { queryChannelsSync } from './query-sync';

export function get(key: ArrayBuffer, instanceID?: string) {
  return queryChannelsSync((channel) => {
    if (channel.getObject) {
      return channel.getObject(key);
    }
  }, instanceID);
}

export function put(key: ArrayBuffer, value: ArrayBuffer, instanceID?: string) {
  return queryChannelsAsync((channel) => {
    if (channel.putObject) {
      return channel.putObject(key, value);
    }
  }, instanceID);
}

export function remove(key: ArrayBuffer, instanceID?: string) {
  return queryChannelsAsync((channel) => {
    if (channel.deleteObject) {
      return channel.deleteObject(key);
    }
  }, instanceID);
}
