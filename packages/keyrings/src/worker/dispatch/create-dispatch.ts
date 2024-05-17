import { WorkerMessageType } from '../types';
import type { Action, Result, WorkerMessage } from '../types';

export type JobResultWorkerMessage<T extends Action = Action> =
  WorkerMessage<WorkerMessageType.RESULT> & { jobID: number } & Result<T>;

export type JobCallback<T extends Action = Action> = (result: JobResultWorkerMessage<T>) => void;

export type Dispatch<T, R> = (payload: T, callback?: DispatchCallback<R>) => void;
export type DispatchCallback<T> = (response: T) => void;

// TODO: convert to promises

export function createDispatch<T, R>(target: Window | Worker, dispatchID: number): Dispatch<T, R> {
  const callbacks: Record<number, DispatchCallback<R>> = {};
  let nextJobID = 0;
  (target as Window).addEventListener('message', (event: MessageEvent<[number, number, R]>) => {
    if (event.data instanceof Array) {
      const [originDispatchID, originJobID, response] = event.data;
      if (originDispatchID == dispatchID) {
        const callback = callbacks[event.data[1]];
        delete callbacks[originJobID];
        if (callback) callback(response);
      }
    }
  });
  return (payload, callback?) => {
    const jobID = nextJobID++;
    if (callback) callbacks[jobID] = callback;
    target.postMessage([dispatchID, jobID, payload]);
  };
}

export function createDeferredDispatch<T, R>(
  target: Window | Worker,
  dispatchID: number,
): Dispatch<T, R> {
  const dispatch = createDispatch<T, R>(target, dispatchID);
  let readyFired = false;
  const readyHandler = (event: MessageEvent<WorkerMessage>) => {
    if (event.data.type === WorkerMessageType.READY) {
      (target as Window).removeEventListener('message', readyHandler);
      target.dispatchEvent(new Event('ready'));
      readyFired = true;
    }
  };
  (target as Window).addEventListener('message', readyHandler);
  return (request, callback?) => {
    if (readyFired) {
      dispatch(request, callback);
    } else {
      const deferredRequestCallback = () => {
        target.removeEventListener('ready', deferredRequestCallback);
        dispatch(request, callback);
      };
      target.addEventListener('ready', deferredRequestCallback);
    }
  };
}
