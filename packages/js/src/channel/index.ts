import { getModule } from '../modules/modules';
import { channelModule } from './channel.module';

export const channel = (instanceID?: string) => getModule(channelModule, instanceID);
export * from './driver/indexeddb';
export type * from './channel.module';
export type * from './types';
