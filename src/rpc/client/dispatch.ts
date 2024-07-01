import type * as T from '../types.js';

/**
 * A function to dispatch a request to a server.
 *
 * @category Dispatch
 * @template Res The expected response type.
 * @template Req The request body type.
 * @param operation The request operation type.
 * @param request The request body.
 * @param instanceID The instance ID, otherwise will use the default instance.
 */
export type Dispatch = <Res, Req = unknown>(
  operation: string,
  request: Req,
  instanceID?: string,
) => Promise<Res>;

/**
 * The interface for an object that can be used as a target for {@linkcode createDispatch}.
 *
 * @category Dispatch
 */
export interface DispatchTarget {
  /** @ignore */
  addEventListener?: T.MessageEventListenerMethod;
  /** @ignore */
  on?: T.MessageEventListenerMethod;
  /** @ignore */
  postMessage(message: T.RequestMessage): unknown;
}

function onMessage<T>(
  target: DispatchTarget,
  listener: Parameters<T.MessageEventListenerMethod<T>>[1],
) {
  if (target.addEventListener) {
    target.addEventListener('message', listener);
  } else if (target.on) {
    target.on('message', listener);
  } else {
    throw new TypeError('Unsupported target');
  }
}

/**
 * Constructs a {@linkcode Dispatch} function for the given {@linkcode DispatchTarget}.
 *
 * @category Dispatch
 */
export function createDispatch(target: DispatchTarget): Dispatch {
  const callbacks: Record<
    number,
    [resolve: (response: unknown) => void, reject: (reason?: string) => void]
  > = {};
  let nextJobID = 0;

  onMessage<T.ResponseMessage>(target, (event) => {
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
    callbacks[jobID] = [resolve as never, reject];
    target.postMessage({ instanceID, jobID, op, payload });
  });
}

/**
 * The interface for an object that can be used as a target for {@linkcode createDeferredDispatch}.
 *
 * @category Dispatch
 */
export interface DeferredDispatchTarget extends DispatchTarget {
  /** @ignore */
  removeEventListener?: T.MessageEventListenerMethod;
  /** @ignore */
  removeListener?: T.MessageEventListenerMethod;
}

type OnReadyQueue = [
  op: string,
  request: unknown,
  resolve: (response: unknown) => void,
  reject: (reason: string) => void,
  instanceID?: string,
][];

/**
 * Constructs a {@linkcode Dispatch} function for the given {@linkcode DispatchTarget}. This type of
 * dispatch will wait for a 'ready' message from the target before dispatching any requests. Until
 * the 'ready' message is received, requests will remain in a queue.
 *
 * @category Dispatch
 */
export function createDeferredDispatch(target: DeferredDispatchTarget): Dispatch {
  const dispatch = createDispatch(target);
  let onReadyQueue: OnReadyQueue | undefined = [];
  function onReady(event: Pick<MessageEvent, 'data'>) {
    if (event.data === 'ready') {
      if (target.removeEventListener) {
        target.removeEventListener('message', onReady);
      } else if (target.removeListener) {
        target.removeListener('message', onReady);
      } else {
        throw new TypeError('Unsupported target');
      }
      for (const [op, request, resolve, reject, instanceID] of onReadyQueue!) {
        void dispatch(op, request, instanceID).then(resolve).catch(reject);
      }
      onReadyQueue = undefined;
    }
  }
  onMessage<'ready'>(target, onReady);
  return (op, request, instanceID) =>
    onReadyQueue
      ? new Promise((resolve, reject) =>
          onReadyQueue!.push([op, request, resolve as never, reject, instanceID]),
        )
      : dispatch(op, request, instanceID);
}
