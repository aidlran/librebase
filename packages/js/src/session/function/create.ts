import type {
  CreateSessionRequest,
  CreateSessionResult,
} from '../../worker/interface/payload/index.js';
import type { WorkerDispatch } from '../../worker/worker-dispatch.js';
import type { AllSessionsSignal, InactiveSession } from '../types.js';
import type { SessionLoadFn } from './load.js';

export interface SessionCreateFn<T = unknown> {
  (options: CreateSessionRequest<T>, callback?: (result: CreateSessionResult) => unknown): void;
  asPromise(options: CreateSessionRequest<T>): Promise<CreateSessionResult>;
}

export const construct = <T = unknown>(
  { postToOne }: Pick<WorkerDispatch, 'postToOne'>,
  load: SessionLoadFn<T>,
  allSessions: AllSessionsSignal,
): SessionCreateFn<T> => {
  const fn: SessionCreateFn<T> = (options, callback) => {
    postToOne({ action: 'session.create', payload: options }, ({ payload }) => {
      const session: InactiveSession<T> = {
        id: payload.id,
        active: false,
      };
      allSessions()[payload.id] = session;
      allSessions.set(allSessions());
      load(payload.id, options.passphrase, (result) => {
        if (callback) callback({ id: result.id, mnemonic: payload.mnemonic });
      });
    });
  };

  fn.asPromise = (options) => {
    return new Promise((resolve) => fn(options, resolve));
  };

  return fn;
};
