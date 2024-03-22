import { tick } from '@adamantjs/signals';
import { channelModule } from '../channel/channel.module';
import type { RetrievedNodeData } from '../channel/types';
import type { Injector } from '../modules/modules';
import { createNode } from './create-node';

export function getNode(this: Injector) {
  return (hash: Uint8Array) => {
    return this(channelModule).getNode(hash, (data) => this(parseSerializedNode)(data, hash));
  };
}

export function parseSerializedNode(this: Injector) {
  return async (data: RetrievedNodeData, hash: Uint8Array) => {
    const node = this(createNode)().setMediaType(data[0]);

    // if (node.mediaType().type === 'application/lb-data') {
    //   switch (node.mediaType().parameters?.['enc']) {
    //     case 'json':
    //     case undefined:
    //       const data: LBDataValue = JsonSerializer.deserialize(payload);
    //       break;
    //     default:
    //       throw new TypeError('Unsupported encoding');
    //   }
    // }

    node.setHashAlg(hash[0]).setMediaType(data[0]).setPayload(data[1]);
    await tick();
    const checkHash = await node.hash();
    if (hash.length != checkHash.length) return;
    for (const i in hash) if (hash[i] !== checkHash[i]) return;
    return node;
  };
}
