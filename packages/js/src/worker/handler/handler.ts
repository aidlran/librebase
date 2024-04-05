import { parse } from 'content-type';
import { queryChannelsAsync, queryChannelsSync } from '../../channel';
import { channels } from '../../channel/channels';
import { codecMap } from '../../codec/codec-map';
import { HashAlgorithm, hash } from '../../hash';
import type { Injector } from '../../modules/modules';
import { getObject, parseObject, putObject, serializeObject } from '../../object';
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
          void queryChannelsSync(inject(channels), (channel) => {
            if (channel.getAddressHash) {
              return channel.getAddressHash(address);
            }
          }).then((hash) => {
            if (hash) {
              void getObject(hash).then((object) => {
                if (object) {
                  const [, mediaTypeString, payload] = parseObject(new Uint8Array(object));
                  const mediaType = parse(mediaTypeString);
                  const codec = inject(codecMap)[mediaType.type];
                  if (!codec) {
                    throw new TypeError('No codec available for ' + mediaType.type);
                  }
                  const objectValue = codec.decode(payload, mediaType);
                  next(objectValue);
                }
              });
            }
          });
          break;
        }
        case WorkerDataRequestType.SET_ROOT_NODE: {
          const [, , , , mediaType, value] = request;
          const payload = serializeObject(value, mediaType);
          const hashAlg = HashAlgorithm.SHA256;
          void putObject(payload, hashAlg, inject.instanceID);
          void hash(hashAlg, payload).then((hash) => {
            void queryChannelsAsync(inject(channels), (channel) => {
              if (channel.setAddressHash) {
                return channel.setAddressHash(address, hash.toBytes());
              }
            });
          });
          break;
        }
      }
    }
  };
}
