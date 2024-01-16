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
      const session = activeSession() as Session;
      if (session) {
        session.active = false;
        activeSession.set(undefined);
        allSessions.set(allSessions());
      }
      if (callback) callback();
    });
  };

  fn.asPromise = () => new Promise(fn);

  return fn;
};
