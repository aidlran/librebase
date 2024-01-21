import { createEffect } from '@adamantjs/signals';
import { type AllSessions, session } from 'librebase';
import { type Readable, readable } from 'svelte/store';

export function allSessions<T = unknown>(appID?: string): Readable<AllSessions<T>> {
  if (!globalThis.window) {
    return readable({});
  }

  // https://svelte.dev/docs/svelte-store
  // "[...] called when the number of subscribers goes from zero to one [...]"
  // "[...] return a stop function that is called when the subscriber count goes from one to zero."
  return readable<AllSessions<T>>(undefined, (update) => {
    return createEffect(() => update(session(appID).allSessions() as AllSessions<T>));
  });
}
