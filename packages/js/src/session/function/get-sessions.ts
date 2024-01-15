import { getAll, type Session as DBSession } from '../../indexeddb/indexeddb.js';
import type { Session, AllSessionsSignal } from '../types.js';

// TODO: refactor/improve architecture
// we have to manually call this
// we'll run into issues when sessions are edited via another tab
// it doesn't remove sessions that were deleted in indexeddb
// we don't know how it affects the active session or anonymous (unsaved) sessions

export function getSessions(allSessions: AllSessionsSignal, callback?: () => unknown) {
  void getAll('session').then((savedSessions) => {
    allSessions.update((memorySessions) => {
      for (const retrievedSession of savedSessions as Array<DBSession & { id: number }>) {
        const existingSession: Partial<DBSession & Session> =
          memorySessions[retrievedSession.id] ?? retrievedSession;
        delete existingSession.nonce;
        delete existingSession.payload;
        delete existingSession.salt;
        existingSession.active ??= false;
        memorySessions[retrievedSession.id] = existingSession as Session;
      }
      return memorySessions;
    });
    if (callback) callback();
  });
}
