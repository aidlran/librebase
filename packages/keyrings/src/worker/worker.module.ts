import { getIdentityValue, putIdentity } from '../main';
import { createDeferredDispatch } from '../shared/dispatch';
import { calculateClusterSize } from './cluster/calculate-cluster-size';
import { roundRobin } from './load-balancer/round-robin';
import type { JobResultWorkerMessage } from './types/job-result-worker-message';
import { WorkerDataRequestType, WorkerMessageType, type WorkerDataRequest } from './types/message';
import type { Action, PostToAllAction, PostToOneAction, Request } from './types/request';

type Config = {
  [T in Action]: [Request<T>, JobResultWorkerMessage<T>];
};

/** @deprecated */
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

export function createWorker(constructor: () => Worker) {
  const length = calculateClusterSize();
  const workers = Array.from({ length }, constructor);
  const dispatches = workers.map((worker) => {
    worker.addEventListener('message', handleMessageFromWorker);
    return createDeferredDispatch<Config>(worker);
  });
  const getNextDispatch = roundRobin(dispatches);
  return {
    postToAll: <T extends PostToAllAction>(operation: T, request: Request<T>) =>
      Promise.all(dispatches.map((dispatch) => dispatch(operation, request))),
    postToOne: <T extends PostToOneAction>(operation: T, request: Request<T>) =>
      getNextDispatch()(operation, request),
  };
}

let workerInstance: ReturnType<typeof createWorker>;

export function getWorker() {
  return workerInstance;
}

export function registerWorker(worker: ReturnType<typeof createWorker>) {
  workerInstance = worker;
}
