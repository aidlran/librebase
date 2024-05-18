import { init as initJSON } from '@librebase/codec-json/recommended';
import { init as initIndexedDB } from '@librebase/driver-indexeddb/recommended';
import { init as initFS } from '@librebase/fs/recommended';

export * from '@librebase/core';
export * from '@librebase/fs';

/** @param {string} [instanceID] */
export async function init(instanceID) {
  initJSON({ instanceID });
  await initIndexedDB({ instanceID });
  initFS(instanceID);
}
