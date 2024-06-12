import { getIdentityValue, putIdentity } from '../main';
import { createDeferredDispatch } from '../shared/dispatch';
import type { HostOriginMessageConfig } from '../shared/message-configs';
import { calculateClusterSize } from './cluster/calculate-cluster-size';
import { roundRobin } from './load-balancer/round-robin';
import { WorkerDataRequestType, WorkerMessageType, type WorkerDataRequest } from './types/message';
import type { PostToAllAction, PostToOneAction } from './types/request';

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
    return createDeferredDispatch<HostOriginMessageConfig>(worker);
  });
  const getNextDispatch = roundRobin(dispatches);
  return {
    postToAll: <T extends PostToAllAction>(
      operation: T,
      request: HostOriginMessageConfig[T][0],
      instanceID?: string,
    ) => Promise.all(dispatches.map((dispatch) => dispatch(operation, request, instanceID))),
    postToOne: <T extends PostToOneAction>(
      operation: T,
      request: HostOriginMessageConfig[T][0],
      instanceID?: string,
    ) => getNextDispatch()(operation, request, instanceID),
  };
}

let workerInstance: ReturnType<typeof createWorker>;

export function getWorker() {
  return workerInstance;
}

export function registerWorker(worker: ReturnType<typeof createWorker>) {
  workerInstance = worker;
}
