import { WorkerMessageType } from '../types';
import type { Action, Request, Result, WorkerMessage } from '../types';

export type JobResultWorkerMessage<T extends Action = Action> =
  WorkerMessage<WorkerMessageType.RESULT> & { jobID: number } & Result<T>;

export type JobCallback<T extends Action = Action> = (result: JobResultWorkerMessage<T>) => void;

export type JobDispatch = <T extends Action>(
  request: Request<T>,
  callback?: JobCallback<T>,
) => void;

// TODO: able to batch send job requests in one message
export function createDispatch(worker: Worker): JobDispatch {
  const jobCallbacks: Record<number, JobCallback> = {};
  let nextJobID = 0;
  let readyFired = false;
  const readyHandler = (event: MessageEvent<WorkerMessage>) => {
    if (event.data.type === WorkerMessageType.READY) {
      worker.removeEventListener('message', readyHandler);
      worker.dispatchEvent(new Event('ready'));
      readyFired = true;
    }
  };
  worker.addEventListener('message', readyHandler);
  worker.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
    if (event.data.type !== WorkerMessageType.RESULT) {
      return;
    }
    const message = event.data as JobResultWorkerMessage;
    const callback = jobCallbacks[message.jobID];
    delete jobCallbacks[message.jobID];
    if (callback) {
      callback(message);
    }
  });
  return (request, callback?) => {
    jobCallbacks[++nextJobID] = callback as JobCallback<Action>;
    // TODO(perf): use array instead of spreading
    if (readyFired) {
      worker.postMessage({ ...request, jobID: nextJobID });
    } else {
      const callback = () => {
        worker.removeEventListener('ready', callback);
        worker.postMessage({ ...request, jobID: nextJobID });
      };
      worker.addEventListener('ready', callback);
    }
  };
}
