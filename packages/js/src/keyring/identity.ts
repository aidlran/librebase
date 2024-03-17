import { derived, tick } from '@adamantjs/signals';
import { format, type MediaType } from 'content-type';
import type { ChannelModule } from '../channel';
import { type HashAlgorithm, SignatureType } from '../crypto';
import type { DataModule } from '../data/data.module';
import type { Node } from '../data/node';
import type { WorkerModule } from '../worker/worker.module';
import type { LBDataValue } from '../data/types';

export interface Identity extends Node {
  address: Uint8Array;
  id: string;
  push: () => Promise<Identity>;
  setHashAlg: (alg: HashAlgorithm) => Identity;
  setMediaType: (type: string | MediaType) => Identity;
  setPayload: (payload: Uint8Array) => Identity;
  setValue: <T>(value: T) => Identity;
  signature: () => Promise<Uint8Array>;
}

async function pushIdentityNode(
  this: [ChannelModule, DataModule['createNode'], Identity],
): Promise<Identity> {
  const [channels, createNode, identity] = this;
  await tick();
  const wrappedNode = createNode()
    .setHashAlg(identity.hashAlg())
    .setMediaType('application/lb-data')
    .setValue<LBDataValue>({
      type: SignatureType.ECDSA,
      hash: await identity.hash(),
      mediaType: format(identity.mediaType()),
      metadata: await identity.signature(),
      payload: identity.payload(),
    });
  const setAddressedHashPromise = wrappedNode
    .hash()
    .then((hash) => channels.setAddressedNodeHash(identity.address, hash));
  await Promise.all([wrappedNode.push(), setAddressedHashPromise]);
  return identity;
}

export async function getIdentity(
  this: [WorkerModule['postToOne'], ChannelModule, Pick<DataModule, 'createNode' | 'getNode'>],
  identityID: string,
): Promise<Identity> {
  const [dispatchJob, channels, data] = this;
  const address = await new Promise<Uint8Array>((resolve) => {
    dispatchJob({ action: 'identity.get', payload: identityID }, (result) =>
      resolve(result.payload),
    );
  });
  const identity = ((await channels.getAddressedNodeHash(address, (hash) => data.getNode(hash))) ??
    data.createNode()) as Node & Partial<Identity>;
  identity.address = address;
  identity.id = identityID;
  identity.push = pushIdentityNode.bind([channels, data.createNode, identity as Identity]);
  identity.signature = derived(() => {
    return identity.hash().then((hash) => {
      return new Promise<Uint8Array>((resolve) => {
        dispatchJob({ action: 'identity.sign', payload: { identityID, hash } }, (result) => {
          resolve(result.payload);
        });
      });
    });
  });
  return identity as Identity;
}
