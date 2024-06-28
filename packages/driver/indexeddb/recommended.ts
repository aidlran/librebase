import { getChannels } from '@astrobase/core';
import { indexeddb, type IndexedDbChannelOptions } from './indexeddb.js';

export interface InitOptions extends IndexedDbChannelOptions {
  instanceID?: string;
}

export async function init(options?: InitOptions) {
  getChannels(options?.instanceID).push(await indexeddb(options));
}
