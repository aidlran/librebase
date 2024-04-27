import { open } from '../indexeddb/indexeddb';

export function openKeyringDB() {
  return open('lbkeyrings', [['keyring', { autoIncrement: true, keyPath: 'id' }]], 1);
}
