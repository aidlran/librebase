import type { WorkerDispatch } from '../../worker/worker-dispatch.js';
import type { Session, ActiveSessionSignal, AllSessionsSignal } from '../types.js';

export interface SessionClearFn {
  (callback?: () => unknown): void;
  asPromise(): Promise<void>;
}

export const construct = (
  { postToAll }: Pick<WorkerDispatch, 'postToAll'>,
  activeSession: ActiveSessionSignal,
  allSessions: AllSessionsSignal,
): SessionClearFn => {
  const fn: SessionClearFn = (callback) => {
    postToAll({ action: 'session.clear' }, () => {
      if (activeSession()) {
        activeSession.update((activeSession) => {
          const session = activeSession as Session;
          session.active = false;
          allSessions.update((value) => value);
          return undefined;
        });
      }
      if (callback) callback();
    });
  };

  fn.asPromise = () => new Promise(fn);

  return fn;
};
