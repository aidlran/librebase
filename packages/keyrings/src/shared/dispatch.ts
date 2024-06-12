export interface Message<Op extends string = string, Payload = unknown> {
  instanceID?: string;
  jobID: number;
  op: Op;
  payload: Payload;
}

export type MessageConfig<T extends string = string> = Record<
  T,
  [request: unknown, response: unknown]
>;

export type OperationsOf<T extends MessageConfig> = Extract<keyof T, string>;
export type RequestsOf<T extends MessageConfig> = T[OperationsOf<T>][0];
export type ResponsesOf<T extends MessageConfig> = T[OperationsOf<T>][1];

export type Dispatch<Config extends MessageConfig> = <T extends OperationsOf<Config>>(
  operation: T,
  request: Config[T][0],
  instanceID?: string,
) => Promise<Config[T][1]>;

type MessageEventListenerMethod<T> = (
  type: 'message',
  listener: (event: { data: T }) => void,
) => unknown;

/*
 * Dispatch
 */

export interface DispatchTarget<Config extends MessageConfig> {
  addEventListener: MessageEventListenerMethod<Message<OperationsOf<Config>, ResponsesOf<Config>>>;
  postMessage(message: Message<OperationsOf<Config>, RequestsOf<Config>>): unknown;
}

export function createDispatch<Config extends MessageConfig>(
  target: DispatchTarget<Config>,
): Dispatch<Config> {
  const callbacks: Record<number, (response: ResponsesOf<Config>) => void> = {};
  let nextJobID = 0;
  target.addEventListener('message', (event) => {
    if (
      typeof event.data === 'object' &&
      typeof event.data.jobID === 'number' &&
      typeof event.data.op === 'string'
    ) {
      const cb = callbacks[event.data.jobID];
      if (cb) {
        delete callbacks[event.data.jobID];
        cb(event.data.payload);
      }
    }
  });
  // prettier-ignore
  return (op, payload, instanceID) => new Promise((resolve) => {
    const jobID = nextJobID++;
    callbacks[jobID] = resolve;
    target.postMessage({ instanceID, jobID, op, payload });
  });
}

/*
 * Deferred Dispatch
 */

export interface DeferredDispatchTarget<Config extends MessageConfig>
  extends DispatchTarget<Config> {
  removeEventListener: MessageEventListenerMethod<'ready'>;
}

type OnReadyQueue<Config extends MessageConfig> = [
  op: OperationsOf<Config>,
  request: RequestsOf<Config>,
  resolve: (response: ResponsesOf<Config>) => void,
  instanceID?: string,
][];

export function createDeferredDispatch<Config extends MessageConfig>(
  target: DeferredDispatchTarget<Config>,
): Dispatch<Config> {
  const dispatch = createDispatch<Config>(target);
  let onReadyQueue: OnReadyQueue<Config> | undefined = [];
  function onReady(event: Pick<MessageEvent, 'data'>) {
    if (event.data === 'ready') {
      target.removeEventListener('message', onReady);
      for (const [op, request, resolve, instanceID] of onReadyQueue!) {
        void dispatch(op, request, instanceID).then(resolve);
      }
      onReadyQueue = undefined;
    }
  }
  target.addEventListener('message', onReady);
  return (op, request, instanceID) =>
    onReadyQueue
      ? new Promise((resolve) => onReadyQueue!.push([op, request, resolve, instanceID]))
      : dispatch(op, request, instanceID);
}
