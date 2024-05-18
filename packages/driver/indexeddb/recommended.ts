import { getChannels } from '@librebase/core';
import { indexeddb, type IndexedDbChannelOptions } from './indexeddb';

export interface InitOptions extends IndexedDbChannelOptions {
  instanceID?: string;
}

export async function init(options?: InitOptions) {
  getChannels(options?.instanceID).push(await indexeddb(options));
}
