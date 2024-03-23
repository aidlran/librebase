import { tick } from '@adamantjs/signals';
import type { RetrievedNodeData } from '../channel';
import { raceChannels } from '../channel/race';
import type { Injector } from '../modules/modules';
import { createNode } from './create-node';

export function getNode(this: Injector) {
  return (hash: Uint8Array) => {
    return this(raceChannels)(
      (channel) => channel.getNode(hash),
      (data) => this(parseSerializedNode)(data, hash),
    );
  };
}

export function getAddressedNode(this: Injector) {
  return (address: Uint8Array) => {
    return this(raceChannels)(
      (channel) => channel.getAddressedNodeHash(address),
      (hash) => this(getNode)(hash),
    );
  };
}

export function parseSerializedNode(this: Injector) {
  return async (data: RetrievedNodeData, hash: Uint8Array) => {
    const node = this(createNode)().setHashAlg(hash[0]).setMediaType(data[0]).setPayload(data[1]);
    await tick();
    const checkHash = await node.hash();
    if (hash.length != checkHash.length) return;
    for (const i in hash) if (hash[i] !== checkHash[i]) return;
    return node;
  };
}
