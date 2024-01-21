import { createEffect, type SignalGetter } from '@adamantjs/signals';
import { session } from 'librebase';
import { readable } from 'svelte/store';

// TODO: lazy create stores by appID, cache and re-return them
//       maybe just use createModule from core package

export function signalToStore<T>(signal: SignalGetter<T>) {
  // https://svelte.dev/docs/svelte-store
  // "[...] called when the number of subscribers goes from zero to one [...]"
  // "[...] return a stop function that is called when the subscriber count goes from one to zero."
  return readable<T>(signal(), (update) => {
    return createEffect(() => update(signal()));
  });
}

export function activeSession<T>(appID?: string) {
  if (!window.globalThis) return readable();
  return signalToStore(session<T>(appID).activeSession);
}

export function allSessions<T>(appID?: string) {
  if (!window.globalThis) return readable();
  return signalToStore(session<T>(appID).allSessions);
}
