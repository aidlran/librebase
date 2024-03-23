import { type SignalGetter, signalToStore } from '@adamantjs/signals/svelte';
import { getActiveKeyring, type Keyring } from 'librebase';
import { readable, type Readable } from 'svelte/store';

// TODO: Use getModule from core package

function createStore<T>(signal: SignalGetter<T>): Readable<T> {
  return window.globalThis ? signalToStore(signal) : readable();
}

export function activeKeyring<T>(instanceID?: string) {
  return createStore<Keyring<T> | undefined>(() => getActiveKeyring<T>(instanceID));
}
