import { type SignalGetter, signalToStore } from '@adamantjs/signals/svelte';
import { keyring, type ActiveKeyring } from 'librebase';
import { derived, readable, type Readable } from 'svelte/store';

// TODO: lazy create stores by appID, cache and re-return them
//       maybe just use createModule from core package

function createStore<T>(signal: SignalGetter<T>): Readable<T> {
  return window.globalThis ? signalToStore(signal) : readable();
}

export function activeKeyring<T>(instanceID?: string) {
  return createStore<ActiveKeyring<T> | undefined>(keyring(instanceID).active);
}

export function identity(identityID: string, instanceID?: string) {
  return derived(activeKeyring(instanceID), (keyring) =>
    Promise.resolve(keyring?.getIdentity(identityID)),
  );
}
