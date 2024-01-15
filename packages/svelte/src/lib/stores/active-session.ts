import { type Readable, readable } from 'svelte/store';
import { type ActiveSession, session } from 'trusync';

// TODO: lazy create stores by appID, cache and re-return them
//       maybe just use createModule from core package

export function activeSession<T = unknown>(appID?: string): Readable<ActiveSession<T> | undefined> {
  if (!globalThis.window) {
    return readable();
  }

  // https://svelte.dev/docs/svelte-store
  return readable<ActiveSession<T> | undefined>(undefined, (update) => {
    // "[...] called when the number of subscribers goes from zero to one [...]"
    // "[...] return a stop function that is called when the subscriber count goes from one to zero."
    return session(appID).activeSession.subscribe((session) => update(session as ActiveSession<T>));
  });
}
