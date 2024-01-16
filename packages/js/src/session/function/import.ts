import type {
  ImportSessionRequest,
  ImportSessionResult,
} from '../../worker/interface/payload/index.js';
import type { WorkerDispatch } from '../../worker/worker-dispatch.js';
import type { AllSessionsSignal, InactiveSession } from '../types.js';
import type { SessionLoadFn } from './load.js';

export interface SessionImportFn<T = unknown> {
  (options: ImportSessionRequest<T>, callback?: (result: ImportSessionResult) => unknown): void;
  asPromise(options: ImportSessionRequest<T>): Promise<ImportSessionResult>;
}

export const construct = <T = unknown>(
  { postToOne }: Pick<WorkerDispatch, 'postToOne'>,
  load: SessionLoadFn,
  allSessions: AllSessionsSignal,
): SessionImportFn => {
  const fn: SessionImportFn = (options, callback): void => {
    postToOne({ action: 'session.import', payload: options }, ({ payload }) => {
      const session: InactiveSession<T> = {
        id: payload.id,
        active: false,
      };
      allSessions()[payload.id] = session;
      allSessions.set(allSessions());
      load(payload.id, options.passphrase, callback);
    });
  };

  fn.asPromise = (options) => {
    return new Promise((resolve) => fn(options, resolve));
  };

  return fn;
};
