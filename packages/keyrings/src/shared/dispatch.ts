export interface Message<Op extends string = string, Payload = unknown> {
  jobID: number;
  op: Op;
  payload: Payload;
}

export type DispatchConfig<T extends string = string> = Record<
  T,
  [request: unknown, result: unknown]
>;

type OpsOf<T extends DispatchConfig> = Extract<keyof T, string>;
type RequestsOf<T extends DispatchConfig> = T[OpsOf<T>][0];
type ResultsOf<T extends DispatchConfig> = T[OpsOf<T>][1];

export type Dispatch<Config extends DispatchConfig> = <Op extends OpsOf<Config>>(
  operation: Op,
  request: Config[Op][0],
) => Promise<Config[Op][1]>;

type MessageEventListenerMethod<T> = (
  type: 'message',
  listener: (event: { data: T }) => void,
) => unknown;

/*
 * Dispatch
 *
 * TODO(feat): Add strict call and response structure
 * TODO(feat): Add error generation
 * TODO(feat): Add message structure checks
 */

export interface DispatchTarget<Config extends DispatchConfig> {
  addEventListener: MessageEventListenerMethod<Message<OpsOf<Config>, ResultsOf<Config>>>;
  postMessage(message: Message<OpsOf<Config>, RequestsOf<Config>>): unknown;
}

export function createDispatch<Config extends DispatchConfig>(
  target: DispatchTarget<Config>,
): Dispatch<Config> {
  const callbacks: Record<number, (result: ResultsOf<Config>) => void> = {};
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
  return (op, payload) => new Promise((resolve) => {
    const jobID = nextJobID++;
    callbacks[jobID] = resolve;
    target.postMessage({ jobID, op, payload });
  });
}

/*
 * Deferred Dispatch
 */

export interface DeferredDispatchTarget<Config extends DispatchConfig>
  extends DispatchTarget<Config> {
  removeEventListener: MessageEventListenerMethod<'ready'>;
}

type OnReadyQueue<Config extends DispatchConfig> = [
  op: OpsOf<Config>,
  request: RequestsOf<Config>,
  resolve: (result: ResultsOf<Config>) => void,
][];

export function createDeferredDispatch<Config extends DispatchConfig>(
  target: DeferredDispatchTarget<Config>,
): Dispatch<Config> {
  const dispatch = createDispatch<Config>(target);
  let onReadyQueue: OnReadyQueue<Config> | undefined = [];
  function onReady(event: Pick<MessageEvent, 'data'>) {
    if (event.data === 'ready') {
      target.removeEventListener('message', onReady);
      for (const [op, request, resolve] of onReadyQueue!) {
        void dispatch(op, request).then(resolve);
      }
      onReadyQueue = undefined;
    }
  }
  target.addEventListener('message', onReady);
  return (op, request) =>
    onReadyQueue
      ? new Promise((resolve) => onReadyQueue!.push([op, request, resolve]))
      : dispatch(op, request);
}
