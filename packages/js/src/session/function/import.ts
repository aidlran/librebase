import type { ImportSessionRequest, ImportSessionResult } from '../../worker/types';
import type { WorkerModule } from '../../worker/worker.module';
import type { AllSessionsSignal, InactiveSession } from '../types';
import type { SessionLoadFn } from './load';

export interface SessionImportFn<T = unknown> {
  (options: ImportSessionRequest<T>, callback?: (result: ImportSessionResult) => unknown): void;
  asPromise(options: ImportSessionRequest<T>): Promise<ImportSessionResult>;
}

export const construct = <T = unknown>(
  { postToOne }: Pick<WorkerModule, 'postToOne'>,
  load: SessionLoadFn,
  [getAllSessions, setAllSessions]: AllSessionsSignal,
): SessionImportFn => {
  const fn: SessionImportFn = (options, callback): void => {
    postToOne({ action: 'session.import', payload: options }, ({ payload }) => {
      const session: InactiveSession<T> = {
        id: payload.id,
        active: false,
      };
      getAllSessions()[payload.id] = session;
      setAllSessions(getAllSessions());
      load(payload.id, options.passphrase, callback);
    });
  };

  fn.asPromise = (options) => {
    return new Promise((resolve) => fn(options, resolve));
  };

  return fn;
};
