import { tick } from '@adamantjs/signals';
import { channelSet } from '../../channel/channel-set';
import { createNode } from '../../data/create-node';
import { getAddressedNode } from '../../data/get-node';
import type { Injector } from '../../modules/modules';
import type { GetRootNodeRequest, SetRootNodeRequest, WorkerDataRequest } from '../types';
import { WorkerDataRequestType, WorkerMessageType } from '../types';

export function handleMessageFromWorker(this: Injector) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const inject = this;
  return function (this: Worker, { data }: MessageEvent<[number, number, WorkerDataRequest]>) {
    if (!(data instanceof Array) || data.length < 3 || !(data[2] instanceof Array)) return;
    const request = data[2];
    const next = (result?: unknown) => this.postMessage([data[0], data[1], result]);
    if (request[0] == WorkerMessageType.DATA) {
      switch (request[1]) {
        case WorkerDataRequestType.GET_ROOT_NODE:
          void getRootNode(inject, request, next);
          break;
        case WorkerDataRequestType.SET_ROOT_NODE:
          void setRootNode(inject, request, next);
          break;
      }
    }
  };
}

async function getRootNode(
  inject: Injector,
  request: GetRootNodeRequest,
  next: (response: unknown) => void,
) {
  const [, , kdfType, publicKey] = request;
  const address = new Uint8Array([kdfType, ...publicKey]);
  const node = await inject(getAddressedNode)(address);
  next(node?.value());
}

async function setRootNode(inject: Injector, request: SetRootNodeRequest, next: () => void) {
  const [, , kdfType, publicKey, mediaType, value] = request;
  const node = inject(createNode)().setMediaType(mediaType).setValue(value);
  await tick();
  await Promise.all([
    node.push(),
    node.hash().then((hash) => {
      const address = new Uint8Array([kdfType, ...publicKey]);
      return Promise.all(
        [...inject(channelSet)].map((channel) => channel.setAddressedNodeHash(address, hash)),
      );
    }),
  ]);
  next();
}
