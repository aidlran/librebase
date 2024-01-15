import { type Readable, readable } from 'svelte/store';
import { type AllSessions, session } from 'trusync';

export function allSessions<T = unknown>(appID?: string): Readable<AllSessions<T>> {
  if (!globalThis.window) {
    return readable({});
  }

  // https://svelte.dev/docs/svelte-store
  return readable<AllSessions<T>>(undefined, (update) => {
    // "[...] called when the number of subscribers goes from zero to one [...]"
    // "[...] return a stop function that is called when the subscriber count goes from one to zero."
    return session(appID).allSessions.subscribe((sessions) => update(sessions as AllSessions<T>));
  });
}
