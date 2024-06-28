import type * as T from '../types.js';
import { processRequest } from './server.js';

export interface ResponderTarget {
  addEventListener?: T.MessageEventListenerMethod<T.RequestMessage>;
  on?: T.MessageEventListenerMethod<T.RequestMessage>;
  postMessage(message: T.ResponseMessage): unknown;
}

const listener: Parameters<T.MessageEventListenerMethod<T.RequestMessage>>[1] = ({ data }) => {
  void processRequest(data).then((response) => self.postMessage(response));
};

export function listen(target: ResponderTarget = self) {
  if (target.addEventListener) {
    target.addEventListener('message', listener);
  } else if (target.on) {
    target.on('message', listener);
  } else {
    throw new TypeError('Unsupported target');
  }
}
