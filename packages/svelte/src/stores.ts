import { type SignalGetter, signalToStore } from '@adamantjs/signals/svelte';
import { keyring, type ActiveKeyring } from 'librebase';
import { readable, type Readable } from 'svelte/store';

// TODO: lazy create stores by appID, cache and re-return them
//       maybe just use createModule from core package

function createStore<T>(signal: SignalGetter<T>): Readable<T> {
  return window.globalThis ? signalToStore(signal) : readable();
}

export function activeSession<T>(appID?: string) {
  return createStore<ActiveKeyring<T> | undefined>(keyring(appID).active);
}
