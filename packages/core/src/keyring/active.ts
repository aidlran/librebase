import { signal } from '@adamantjs/signals';
import type { Keyring } from './types';

/** Used internally as a symbol to get the protocol instance's active keyring signal via `getModule`. */
export function activeKeyring<T>() {
  return signal<Keyring<T> | undefined>(undefined);
}
