import type { CreateSessionRequest } from '../../worker/interface/payload/index.js';
import type { WorkerDispatch } from '../../worker/worker-dispatch.js';
import type { JobCallback } from '../../worker/worker-instance.js';

export const constructCreateSession = <T>({ postToOne }: Pick<WorkerDispatch, 'postToOne'>) => {
  const createSession = (
    options: CreateSessionRequest<T>,
    callback?: (mnemonic: string) => unknown,
  ) => {
    let handler: JobCallback<'session.create'> | undefined;
    if (callback) handler = ({ payload }) => callback(payload.mnemonic);
    postToOne({ action: 'session.create', payload: options }, handler);
  };

  createSession.asPromise = (options: CreateSessionRequest<T>) => {
    return new Promise<string>((resolve) => createSession(options, resolve));
  };

  return createSession;
};