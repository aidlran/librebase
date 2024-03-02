import { tick } from '@adamantjs/signals';
import type { ChannelDriver } from '../channel/types';
import type { DataModule } from '../data/data.module';
import type { Node } from '../data/node';
import type { WorkerModule } from '../worker/worker.module';

export interface Identity {
  address: Promise<Uint8Array>;
  rootNode: Promise<Node>;
}

async function pushRootNode(
  this: [Uint8Array, Node, () => Promise<Node>, ChannelDriver[]],
): Promise<Node> {
  const [address, node, push, channels] = this;
  await tick();
  // TODO: move this method to ChannelModule
  const setAddressedHashPromise = node
    .hash()
    .then((hash) =>
      Promise.allSettled([...channels].map((driver) => driver.setAddressedNodeHash(address, hash))),
    );
  await Promise.all([push(), setAddressedHashPromise]);
  return node;
}

async function getRootNode(
  channels: ChannelDriver[],
  data: Pick<DataModule, 'createNode' | 'getNode'>,
  addressPromise: Promise<Uint8Array>,
) {
  const address = await addressPromise;
  // TODO: move this method to ChannelModule
  const hash = await Promise.race(
    channels.map((channel) => Promise.resolve(channel.getAddressedNodeHash(address))),
  );
  const node = hash
    ? await data.getNode(hash).then((node) => node ?? data.createNode())
    : data.createNode();
  node.push = pushRootNode.bind([address, node, node.push, channels]);
  return node;
}

export function getIdentity(
  this: [WorkerModule['postToOne'], Set<ChannelDriver>, Pick<DataModule, 'createNode' | 'getNode'>],
  id: string,
): Identity {
  const [dispatchJob, channelSet, data] = this;
  const address = new Promise<Uint8Array>((resolve) => {
    dispatchJob({ action: 'identity.get', payload: id }, (result) => resolve(result.payload));
  });
  const rootNode = getRootNode([...channelSet], data, address);
  return { address, rootNode };
}
