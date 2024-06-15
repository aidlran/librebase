import type { MaybePromise } from '@librebase/core';
import type * as T from './types.js';

export type ResponderCallbacks<Config extends T.MessageConfig> = {
  [T in T.OperationsOf<Config>]: (
    request: Config[T][0],
    instanceID?: string,
  ) => MaybePromise<Config[T][1]>;
};

export interface ResponderTarget<Config extends T.MessageConfig> {
  addEventListener: T.MessageEventListenerMethod<
    T.RequestMessage<T.OperationsOf<Config>, T.RequestsOf<Config>>
  >;
  postMessage(message: T.ResponseMessage<T.OperationsOf<Config>, T.ResponsesOf<Config>>): unknown;
}

export function createResponder<Config extends T.MessageConfig>(
  target: ResponderTarget<Config>,
  callbacks: ResponderCallbacks<Config>,
) {
  target.addEventListener('message', ({ data }) => {
    // prettier-ignore
    const respond = (response: Partial<T.ResponseMessage>) => target.postMessage({
      instanceID: data.instanceID,
      jobID: data.jobID,
      op: data.op,
      ...response,
    } as never);
    // prettier-ignore
    const reject = (error?: string) => respond({
      error,
      ok: false,
    });
    try {
      Promise.resolve(callbacks[data.op](data.payload, data.instanceID))
        // @ts-expect-error
        .then(respond)
        .catch((error) => reject(error instanceof Error ? error.message : undefined));
    } catch (e) {
      reject(e instanceof Error ? e.message : undefined);
      throw e;
    }
  });
}
