import type * as T from '../../types.js';
import { processRequest } from '../server.js';

export interface ResponderTarget {
  addEventListener: T.MessageEventListenerMethod<T.RequestMessage>;
  postMessage(message: T.ResponseMessage): unknown;
}

export function listen(target: ResponderTarget = self) {
  target.addEventListener('message', ({ data }) => {
    void processRequest(data).then((response) => self.postMessage(response));
  });
}
