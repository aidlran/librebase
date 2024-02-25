import type { ChannelDriver } from '../../channel/types';
import type { DataModule } from '../../data/data.module';
import type { WorkerDataRequest } from '../types';
import { WorkerDataRequestType, WorkerMessageType } from '../types';

export function buildMessageHandler(channels: Set<ChannelDriver>, dataModule: DataModule) {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  return function (this: Worker, { data }: MessageEvent<[number, number, WorkerDataRequest]>) {
    if (!(data instanceof Array) || data.length < 3 || !(data[2] instanceof Array)) return;
    const request = data.pop() as WorkerDataRequest;
    const response = data;
    const [messageType, requestType, ...params] = request;
    if (
      messageType === WorkerMessageType.DATA &&
      requestType === WorkerDataRequestType.GET_ROOT_NODE
    ) {
      const [kdfType, publicKey] = params;
      // TODO: move this method to ChannelModule
      void Promise.race(
        [...channels].map((channel) =>
          Promise.resolve(channel.getAddressedNodeHash(new Uint8Array([kdfType, ...publicKey]))),
        ),
      ).then((address) => {
        if (!address) return this.postMessage(response);
        void dataModule.getNode(address).then((node) => {
          if (!node) return this.postMessage(response);
          response.push(node.value());
          this.postMessage(response);
        });
      });
    }
  };
}
