import type { Cluster } from '../../worker/cluster/create-cluster';
import type { CreateSessionRequest, CreateSessionResult } from '../../worker/types';
import type { AllSessionsSignal, InactiveSession } from '../types';
import type { SessionLoadFn } from './load';

export interface SessionCreateFn<T = unknown> {
  (options: CreateSessionRequest<T>, callback?: (result: CreateSessionResult) => unknown): void;
  asPromise(options: CreateSessionRequest<T>): Promise<CreateSessionResult>;
}

export const construct = <T = unknown>(
  { postToOne }: Pick<Cluster, 'postToOne'>,
  load: SessionLoadFn<T>,
  [getAllSessions, setAllSessions]: AllSessionsSignal,
): SessionCreateFn<T> => {
  const fn: SessionCreateFn<T> = (options, callback) => {
    postToOne({ action: 'session.create', payload: options }, ({ payload }) => {
      const session: InactiveSession<T> = {
        id: payload.id,
        active: false,
      };
      getAllSessions()[payload.id] = session;
      setAllSessions(getAllSessions());
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
