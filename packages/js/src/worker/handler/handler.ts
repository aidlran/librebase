import { getIdentityValue, putIdentity } from '../../identity';
import type { Injector } from '../../modules/modules';
import type { WorkerDataRequest } from '../types';
import { WorkerDataRequestType, WorkerMessageType } from '../types';

export function handleMessageFromWorker(this: Injector) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const inject = this;
  return function (this: Worker, { data }: MessageEvent<[number, number, WorkerDataRequest]>) {
    if (!(data instanceof Array) || data.length < 3 || !(data[2] instanceof Array)) return;
    const request = data[2];
    const next = (result?: unknown) => this.postMessage([data[0], data[1], result]);
    const [, , kdfType, publicKey] = request;
    const address = new Uint8Array([kdfType, ...publicKey]);
    if (request[0] == WorkerMessageType.DATA) {
      switch (request[1]) {
        case WorkerDataRequestType.GET_ROOT_NODE: {
          void getIdentityValue(address, inject.instanceID).then(next);
          break;
        }
        case WorkerDataRequestType.SET_ROOT_NODE: {
          const [, , , , mediaType, value] = request;
          void putIdentity(address, value, mediaType, { instanceID: inject.instanceID }).then(() =>
            next(),
          );
          break;
        }
      }
    }
  };
}
