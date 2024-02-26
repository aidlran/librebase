import { getChannelModule } from '../channel/channel.module';
import { getDataModule } from '../data/data.module';
import { createModule } from '../module/create-module';
import { calculateClusterSize } from './cluster/calculate-cluster-size';
import { createWorker } from './constructor/create-worker';
import { createDeferredDispatch } from './dispatch/create-dispatch';
import type { Dispatch, JobResultWorkerMessage } from './dispatch/create-dispatch';
import { buildMessageHandler } from './handler/handler';
import { roundRobin } from './load-balancer/round-robin';
import type { Action, PostToAllAction, PostToOneAction, Request } from './types';

type JobDispatch<T extends Action = Action> = Dispatch<Request<T>, JobResultWorkerMessage<T>>;

export interface WorkerModule {
  postToAll: <T extends PostToAllAction>(
    message: Request<T>,
    callback?: (responses: JobResultWorkerMessage<T>[]) => void,
  ) => void;
  postToOne: <T extends PostToOneAction>(
    message: Request<T>,
    callback?: (response: JobResultWorkerMessage<T>) => void,
  ) => void;
}

export const getJobWorker = createModule<WorkerModule>((key) => {
  const channels = getChannelModule(key);
  const data = getDataModule(key);
  const length = calculateClusterSize();
  const workers = Array.from({ length }, createWorker);
  const dispatches = workers.map<JobDispatch>((worker) => {
    worker.addEventListener('message', buildMessageHandler(channels, data));
    return createDeferredDispatch(worker, 0);
  });
  const getNextDispatch = roundRobin(dispatches);

  // TODO(refactor): make these promises

  return {
    postToAll<T extends PostToAllAction>(
      message: Request<T>,
      callback?: (responses: JobResultWorkerMessage<T>[]) => void,
    ) {
      let handleResponse: ((response: JobResultWorkerMessage<T>) => void) | undefined;
      if (callback) {
        const responses = new Array<JobResultWorkerMessage<T>>();
        handleResponse = (response) => {
          if (responses.push(response) == dispatches.length) {
            callback(responses);
          }
        };
      }
      for (const dispatch of dispatches as unknown as JobDispatch<T>[]) {
        dispatch(message, handleResponse);
      }
    },
    postToOne<T extends PostToOneAction>(
      message: Request<T>,
      callback?: (response: JobResultWorkerMessage<T>) => void,
    ) {
      const dispatch = getNextDispatch();
      dispatch(message, callback as never);
    },
  };
});
