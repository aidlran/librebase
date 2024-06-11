import { getIdentityValue, putIdentity } from '../main';
import { createDeferredDispatch, type Dispatch } from '../shared/dispatch';
import { calculateClusterSize } from './cluster/calculate-cluster-size';
import { roundRobin } from './load-balancer/round-robin';
import type { JobResultWorkerMessage } from './types/job-result-worker-message';
import { WorkerDataRequestType, WorkerMessageType, type WorkerDataRequest } from './types/message';
import type { Action, PostToAllAction, PostToOneAction, Request } from './types/request';

type JobDispatch<T extends Action = Action> = Dispatch<Request<T>, JobResultWorkerMessage<T>>;

export interface WorkerModule {
  postToAll<T extends PostToAllAction>(message: Request<T>): Promise<JobResultWorkerMessage<T>[]>;
  postToOne<T extends PostToOneAction>(message: Request<T>): Promise<JobResultWorkerMessage<T>>;
}

function handleMessageFromWorker(
  this: Worker,
  { data }: MessageEvent<[number, number, WorkerDataRequest]>,
) {
  if (!(data instanceof Array) || data.length < 3 || !(data[2] instanceof Array)) return;
  const request = data[2];
  const next = (result?: unknown) => this.postMessage([data[0], data[1], result]);
  const [, , kdfType, publicKey] = request;
  const address = new Uint8Array([kdfType, ...publicKey]);
  if (request[0] == WorkerMessageType.DATA) {
    switch (request[1]) {
      case WorkerDataRequestType.GET_ROOT_NODE: {
        void getIdentityValue(address, request[4]).then(next);
        break;
      }
      case WorkerDataRequestType.SET_ROOT_NODE: {
        const [, , , , mediaType, value] = request;
        void putIdentity(address, value, mediaType, { instanceID: request[6] }).then(() => next());
        break;
      }
    }
  }
}

export function worker(constructor: () => Worker): WorkerModule {
  const length = calculateClusterSize();
  const workers = Array.from({ length }, constructor);
  const dispatches = workers.map<JobDispatch>((worker) => {
    worker.addEventListener('message', handleMessageFromWorker);
    return createDeferredDispatch(worker);
  });
  const getNextDispatch = roundRobin(dispatches);
  return {
    // prettier-ignore
    postToAll: <T extends PostToAllAction>(message: Request<T>) => Promise.all(
      dispatches.map((dispatch) => dispatch(message) as Promise<JobResultWorkerMessage<T>>),
    ),
    postToOne: <T extends PostToOneAction>(message: Request<T>) =>
      getNextDispatch()(message) as Promise<JobResultWorkerMessage<T>>,
  };
}

let workerInterface: WorkerModule;

export function getWorker() {
  return workerInterface;
}

export function registerWorker(worker: WorkerModule) {
  workerInterface = worker;
}
