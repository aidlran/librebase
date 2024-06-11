export interface DispatchMessage<T = unknown> {
  jobID: number;
  payload: T;
}

export type Dispatch<T, R> = (payload: T) => Promise<R>;

type MessageEventListenerMethod<T> = (
  type: 'message',
  listener: (event: { data: T }) => void,
) => unknown;

/*
 * Dispatch
 */

export interface DispatchTarget<T, R> {
  addEventListener: MessageEventListenerMethod<DispatchMessage<R>>;
  postMessage(message: DispatchMessage<T>): unknown;
}

// TODO(feat): Add responder/handler functionality
// TODO(feat): Add strict call and response structure
// TODO(feat): Add error generation
// TODO(feat): Add message structure checks
export function createDispatch<T, R>(target: DispatchTarget<T, R>): Dispatch<T, R> {
  const callbacks: Record<number, (result: R) => void> = {};
  let nextJobID = 0;
  target.addEventListener('message', (event) => {
    if (typeof event.data === 'object' && typeof event.data.jobID === 'number') {
      const cb = callbacks[event.data.jobID];
      delete callbacks[event.data.jobID];
      if (cb) {
        cb(event.data.payload);
      }
    }
  });
  // prettier-ignore
  return (payload) => new Promise((resolve) => {
    const jobID = nextJobID++;
    callbacks[jobID] = resolve;
    target.postMessage({ jobID, payload });
  });
}

/*
 * Deferred Dispatch
 */

export interface DeferredDispatchTarget<T, R> extends DispatchTarget<T, R> {
  removeEventListener: MessageEventListenerMethod<'ready'>;
}

export function createDeferredDispatch<T, R>(target: DeferredDispatchTarget<T, R>): Dispatch<T, R> {
  const dispatch = createDispatch<T, R>(target);
  let onReadyQueue: [request: T, resolve: (result: R) => void][] | undefined = [];
  function onReady(event: Pick<MessageEvent, 'data'>) {
    if (event.data === 'ready') {
      target.removeEventListener('message', onReady);
      for (const [request, resolve] of onReadyQueue!) {
        void dispatch(request).then(resolve);
      }
      onReadyQueue = undefined;
    }
  }
  target.addEventListener('message', onReady);
  return (payload) =>
    onReadyQueue
      ? new Promise((resolve) => onReadyQueue!.push([payload, resolve]))
      : dispatch(payload);
}
