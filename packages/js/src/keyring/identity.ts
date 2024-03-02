import { tick } from '@adamantjs/signals';
import type { ChannelModule } from '../channel';
import type { DataModule } from '../data/data.module';
import type { Node } from '../data/node';
import type { WorkerModule } from '../worker/worker.module';

export interface Identity {
  address: Uint8Array;
  rootNode: Node;
}

async function pushRootNode(
  this: [Uint8Array, Node, () => Promise<Node>, ChannelModule],
): Promise<Node> {
  const [address, node, push, channels] = this;
  await tick();
  const setAddressedHashPromise = node
    .hash()
    .then((hash) => channels.setAddressedNodeHash(address, hash));
  await Promise.all([push(), setAddressedHashPromise]);
  return node;
}

export async function getIdentity(
  this: [WorkerModule['postToOne'], ChannelModule, Pick<DataModule, 'createNode' | 'getNode'>],
  id: string,
): Promise<Identity> {
  const [dispatchJob, channels, data] = this;
  const address = await new Promise<Uint8Array>((resolve) => {
    dispatchJob({ action: 'identity.get', payload: id }, (result) => resolve(result.payload));
  });
  // TODO(feat): validate that it was signed by the address owner
  let rootNode = await channels.getAddressedNodeHash(address, (hash) => data.getNode(hash));
  if (!rootNode) rootNode = data.createNode();
  rootNode.push = pushRootNode.bind([address, rootNode, rootNode.push, channels]);
  return { address, rootNode };
}
