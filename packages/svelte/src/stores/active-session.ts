import { createEffect } from '@adamantjs/signals';
import { type ActiveSession, session } from 'librebase';
import { type Readable, readable } from 'svelte/store';

// TODO: lazy create stores by appID, cache and re-return them
//       maybe just use createModule from core package

export function activeSession<T = unknown>(appID?: string): Readable<ActiveSession<T> | undefined> {
  if (!globalThis.window) {
    return readable();
  }

  // https://svelte.dev/docs/svelte-store
  // "[...] called when the number of subscribers goes from zero to one [...]"
  // "[...] return a stop function that is called when the subscriber count goes from one to zero."
  return readable<ActiveSession<T> | undefined>(undefined, (update) => {
    return createEffect(() => update(session(appID).activeSession() as ActiveSession<T>));
  });
}
