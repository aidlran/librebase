import type * as T from './types.js';

export type Dispatch<Config extends T.MessageConfig> = <T extends T.OperationsOf<Config>>(
  operation: T,
  request: Config[T][0],
  instanceID?: string,
) => Promise<Config[T][1]>;

export interface DispatchTarget {
  addEventListener: T.MessageEventListenerMethod<T.ResponseMessage>;
  postMessage(message: T.RequestMessage): unknown;
}

export function createDispatch<Config extends T.MessageConfig>(
  target: DispatchTarget,
): Dispatch<Config> {
  const callbacks: Record<
    number,
    [resolve: (response: T.ResponsesOf<Config>) => void, reject: (reason?: string) => void]
  > = {};
  let nextJobID = 0;
  target.addEventListener('message', (event) => {
    if (
      typeof event.data === 'object' &&
      typeof event.data.jobID === 'number' &&
      typeof event.data.op === 'string'
    ) {
      const cb = callbacks[event.data.jobID];
      if (cb) {
        delete cb[event.data.jobID];
        event.data.ok ? cb[0](event.data.payload) : cb[1](event.data.error);
      }
    }
  });
  // prettier-ignore
  return (op, payload, instanceID) => new Promise((resolve, reject) => {
    const jobID = nextJobID++;
    callbacks[jobID] = [resolve, reject];
    target.postMessage({ instanceID, jobID, op, payload });
  });
}

export interface DeferredDispatchTarget extends DispatchTarget {
  removeEventListener: T.MessageEventListenerMethod<'ready'>;
}

type OnReadyQueue<Config extends T.MessageConfig> = [
  op: T.OperationsOf<Config>,
  request: T.RequestsOf<Config>,
  resolve: (response: T.ResponsesOf<Config>) => void,
  reject: (reason: string) => void,
  instanceID?: string,
][];

export function createDeferredDispatch<Config extends T.MessageConfig>(
  target: DeferredDispatchTarget,
): Dispatch<Config> {
  const dispatch = createDispatch<Config>(target);
  let onReadyQueue: OnReadyQueue<Config> | undefined = [];
  function onReady(event: Pick<MessageEvent, 'data'>) {
    if (event.data === 'ready') {
      target.removeEventListener('message', onReady);
      for (const [op, request, resolve, reject, instanceID] of onReadyQueue!) {
        void dispatch(op, request, instanceID).then(resolve).catch(reject);
      }
      onReadyQueue = undefined;
    }
  }
  target.addEventListener('message', onReady);
  return (op, request, instanceID) =>
    onReadyQueue
      ? new Promise((resolve, reject) =>
          onReadyQueue!.push([op, request, resolve, reject, instanceID]),
        )
      : dispatch(op, request, instanceID);
}
