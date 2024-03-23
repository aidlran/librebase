import { derived, tick } from '@adamantjs/signals';
import type { MediaType } from 'content-type';
import { channelSet } from '../channel/channel-set';
import { type HashAlgorithm, SignatureType } from '../crypto';
import { createNode, type Node } from '../data/create-node';
import { getAddressedNode } from '../data/get-node';
import { getModule } from '../modules/modules';
import { jobWorker } from '../worker/worker.module';

export interface Identity extends Node {
  id: string;
  publicKey: Uint8Array;
  push: () => Promise<Identity>;
  setHashAlg: (alg: HashAlgorithm) => Identity;
  setMediaType: (type: string | MediaType) => Identity;
  setPayload: (payload: Uint8Array) => Identity;
  setValue: <T>(value: T) => Identity;
  signature: () => Promise<Uint8Array>;
}

/**
 * Gets the identity from the active keyring of the protocol instance.
 *
 * @param {string} identityID The ID of the identity.
 * @param {string} [instanceID] A particular protocol instance ID can be used if using multiple
 *   protocol instances.
 * @returns {Promise<Identity>} A promise that resolves with the identity.
 */
export async function getIdentity(identityID: string, instanceID?: string) {
  const publicKey = await new Promise<Uint8Array>((resolve) => {
    getModule(jobWorker, instanceID).postToOne(
      { action: 'identity.get', payload: identityID },
      (result) => resolve(result.payload),
    );
  });

  const identity = ((await getModule(getAddressedNode, instanceID)(publicKey)) ??
    getModule(createNode, instanceID)()) as Identity;

  identity.publicKey = publicKey;
  identity.id = identityID;

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const getPayload = identity.payload;
  identity.payload = derived(async () => {
    identity.pushWrapper({ type: SignatureType.ECDSA, metadata: publicKey });
    const payload = await getPayload();
    identity.popWrapper();
    return payload;
  });

  identity.push = pushIdentityNode.bind([identity, identity.push, instanceID]);

  return identity;
}

/** This function is bound and attached to the `Identity`, overriding the base `node.push` function. */
async function pushIdentityNode(this: [Identity, () => Promise<Identity>, string?]) {
  const [identity, push, instanceID] = this;
  await tick();
  const setAddressedHashPromise = identity.hash().then((hash) => {
    return Promise.all(
      [...getModule(channelSet, instanceID)].map((channel) => {
        return channel.setAddressedNodeHash(identity.publicKey, hash);
      }),
    );
  });
  identity.pushWrapper({ type: SignatureType.ECDSA, metadata: identity.publicKey });
  await Promise.all([push(), setAddressedHashPromise]);
  identity.popWrapper();
  return identity;
}
