import { open } from './indexeddb.js';

/** @deprecated */
export function openKeyringDB() {
  return open('lbkeyrings', [['keyring', { autoIncrement: true, keyPath: 'id' }]], 1);
}
