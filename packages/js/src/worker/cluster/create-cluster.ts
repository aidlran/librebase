import type { JobDispatch, JobResultWorkerMessage } from '../dispatch/create-dispatch';
import type { LoadBalancer } from '../load-balancer/type';
import type { PostToAllAction, PostToOneAction, Request } from '../types';

export interface Cluster {
  postToAll: <T extends PostToAllAction>(
    message: Request<T>,
    callback?: (responses: JobResultWorkerMessage<T>[]) => void,
  ) => void;
  postToOne: <T extends PostToOneAction>(
    message: Request<T>,
    callback?: (response: JobResultWorkerMessage<T>) => void,
  ) => void;
}

export function createCluster(dispatchers: JobDispatch[], loadBalancer: LoadBalancer): Cluster {
  const getNext = loadBalancer(dispatchers);
  return {
    postToAll<T extends PostToAllAction>(
      message: Request<T>,
      callback?: (responses: JobResultWorkerMessage<T>[]) => void,
    ) {
      let handleResponse: (response: JobResultWorkerMessage<T>) => void;
      if (callback) {
        const responses = new Array<JobResultWorkerMessage<T>>();
        handleResponse = (response) => {
          if (responses.push(response) == dispatchers.length) {
            callback(responses);
          }
        };
      }
      dispatchers.forEach((dispatch) => dispatch(message, handleResponse));
    },
    postToOne<T extends PostToOneAction>(
      message: Request<T>,
      callback?: (response: JobResultWorkerMessage<T>) => void,
    ) {
      const dispatch = getNext();
      dispatch(message, callback);
    },
  };
}
