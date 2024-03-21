import { tick } from '@adamantjs/signals';
import { channelModule } from '../../channel/channel.module';
import { dataModule } from '../../data/data.module';
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
  const node = await inject(channelModule).getAddressedNodeHash(
    new Uint8Array([kdfType, ...publicKey]),
    (hash) => inject(dataModule).getNode(hash),
  );
  next(node?.value());
}

async function setRootNode(inject: Injector, request: SetRootNodeRequest, next: () => void) {
  const [, , kdfType, publicKey, mediaType, value] = request;
  const node = inject(dataModule).createNode().setMediaType(mediaType).setValue(value);
  await tick();
  await Promise.all([
    node.push(),
    node.hash().then((hash) => {
      return inject(channelModule).setAddressedNodeHash(
        new Uint8Array([kdfType, ...publicKey]),
        hash,
      );
    }),
  ]);
  next();
}
