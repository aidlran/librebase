import type { WorkerModule } from '../../worker/worker.module';
import type { Session, ActiveSessionSignal, AllSessionsSignal } from '../types';

export interface SessionClearFn {
  (callback?: () => unknown): void;
  asPromise(): Promise<void>;
}

export const construct = (
  { postToAll }: Pick<WorkerModule, 'postToAll'>,
  [getActiveSession, setActiveSession]: ActiveSessionSignal,
  [getAllSessions, setAllSessions]: AllSessionsSignal,
): SessionClearFn => {
  const fn: SessionClearFn = (callback) => {
    postToAll({ action: 'session.clear' }, () => {
      const session = getActiveSession() as Session;
      if (session) {
        session.active = false;
        setActiveSession(undefined);
        setAllSessions(getAllSessions());
      }
      if (callback) callback();
    });
  };

  fn.asPromise = () => new Promise(fn);

  return fn;
};
