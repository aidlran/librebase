import { createModule } from '../module/create-module';
import { calculateClusterSize } from './cluster/calculate-cluster-size';
import { createWorker } from './constructor/create-worker';
import { createDispatch, type JobResultWorkerMessage } from './dispatch/create-dispatch';
import { roundRobin } from './load-balancer/round-robin';
import type { PostToAllAction, PostToOneAction } from './types/action';
import type { Request } from './types/request';

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

export const getWorkerModule = createModule<WorkerModule>(() => {
  const length = calculateClusterSize();
  const workers = Array.from({ length }, createWorker);
  const dispatches = workers.map(createDispatch);
  const getNextDispatch = roundRobin(dispatches);
  return {
    postToAll<T extends PostToAllAction>(
      message: Request<T>,
      callback?: (responses: JobResultWorkerMessage<T>[]) => void,
    ) {
      let handleResponse: (response: JobResultWorkerMessage<T>) => void;
      if (callback) {
        const responses = new Array<JobResultWorkerMessage<T>>();
        handleResponse = (response) => {
          if (responses.push(response) == dispatches.length) {
            callback(responses);
          }
        };
      }
      dispatches.forEach((dispatch) => dispatch(message, handleResponse));
    },
    postToOne<T extends PostToOneAction>(
      message: Request<T>,
      callback?: (response: JobResultWorkerMessage<T>) => void,
    ) {
      const dispatch = getNextDispatch();
      dispatch(message, callback);
    },
  };
});
