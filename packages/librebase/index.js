import { init as initJSON } from '@librebase/codec-json/recommended';
import { getChannels } from '@librebase/core';
import { indexeddb } from '@librebase/driver-indexeddb';
import { init as initFS } from '@librebase/fs/recommended';
import { init as initWraps } from '@librebase/wraps/recommended';

export * from '@librebase/core';
export * from '@librebase/fs';
export * from '@librebase/keyrings';
export * from '@librebase/wraps';

/** @param {string} [instanceID] */
export async function init(instanceID) {
  initJSON({ instanceID });
  getChannels(instanceID).push(await indexeddb());
  initFS(instanceID);
  initWraps(instanceID);
}
