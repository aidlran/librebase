import { tick } from '@adamantjs/signals';
import type { ChannelModule } from '../../channel';
import type { DataModule } from '../../data/data.module';
import type { GetRootNodeRequest, SetRootNodeRequest, WorkerDataRequest } from '../types';
import { WorkerDataRequestType, WorkerMessageType } from '../types';

export function buildMessageHandler(channels: ChannelModule, dataModule: DataModule) {
  const getRootNode = handleGetRootNodeRequest.bind([channels, dataModule]);
  const setRootNode = handleSetRootNodeRequest.bind([channels, dataModule]);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  return function (this: Worker, { data }: MessageEvent<[number, number, WorkerDataRequest]>) {
    if (!(data instanceof Array) || data.length < 3 || !(data[2] instanceof Array)) return;
    const request = data[2];
    const next = (result: unknown) => this.postMessage([data[0], data[1], result]);
    if (request[0] == WorkerMessageType.DATA) {
      switch (request[1]) {
        case WorkerDataRequestType.GET_ROOT_NODE:
          void getRootNode(request, next);
          break;
        case WorkerDataRequestType.SET_ROOT_NODE:
          void setRootNode(request, next);
          break;
      }
    }
  };
}

async function handleGetRootNodeRequest(
  this: [ChannelModule, DataModule],
  request: GetRootNodeRequest,
  next: (response: unknown) => void,
) {
  const [channels, dataModule] = this;
  const [, , kdfType, publicKey] = request;
  const node = await channels.getAddressedNodeHash(
    new Uint8Array([kdfType, ...publicKey]),
    (hash) => dataModule.getNode(hash),
  );
  next(node?.value());
}

async function handleSetRootNodeRequest(
  this: [ChannelModule, Pick<DataModule, 'createNode'>],
  request: SetRootNodeRequest,
  next: (response: void) => void,
) {
  const [channels, { createNode }] = this;
  const [, , kdfType, publicKey, mediaType, value] = request;
  const node = createNode().setMediaType(mediaType).setValue(value);
  await tick();
  await Promise.all([
    node.push(),
    node
      .hash()
      .then((hash) => channels.setAddressedNodeHash(new Uint8Array([kdfType, ...publicKey]), hash)),
  ]);
  next();
}
