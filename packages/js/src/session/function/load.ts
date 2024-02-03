import type { SignalSetter } from '@adamantjs/signals';
import type { LoadSessionResult } from '../../worker/types';
import type { WorkerModule } from '../../worker/worker.module';
import type { ActiveSession, AllSessionsSignal } from '../types';

export interface SessionLoadFn<T = unknown> {
  (
    sessionID: number,
    passphrase: string,
    callback?: (result: LoadSessionResult<T>) => unknown,
  ): void;
  asPromise(sessionID: number, passphrase: string): Promise<LoadSessionResult<T>>;
}

export const construct = <T = unknown>(
  { postToAll }: Pick<WorkerModule, 'postToAll'>,
  setActiveSession: SignalSetter<ActiveSession>,
  [getAllSessions, setAllSessions]: AllSessionsSignal,
): SessionLoadFn<T> => {
  const fn: SessionLoadFn<T> = (id, passphrase, callback) => {
    postToAll({ action: 'session.load', payload: { id, passphrase } }, ([{ payload }]) => {
      const session: ActiveSession<T> = {
        id: payload.id,
        metadata: payload.metadata as T,
        active: true,
      };
      getAllSessions()[payload.id] = session;
      setAllSessions(getAllSessions());
      setActiveSession(session);
      if (callback) callback(payload as LoadSessionResult<T>);
    });
  };

  fn.asPromise = (sessionID, passphrase) => {
    return new Promise((resolve) => fn(sessionID, passphrase, resolve));
  };

  return fn;
};
