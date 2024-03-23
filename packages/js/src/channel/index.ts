import { getModule } from '../modules/modules';
import { channelSet } from './channel-set';
import type { ChannelDriver } from './types';

export * from './driver/indexeddb';
export type * from './types';

export function registerDriver(driver: ChannelDriver, instanceID?: string) {
  return getModule(channelSet, instanceID).add(driver);
}

export function unregisterDriver(driver: ChannelDriver, instanceID?: string) {
  return getModule(channelSet, instanceID).delete(driver);
}
