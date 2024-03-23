import { derived, tick } from '@adamantjs/signals';
import { format, type MediaType } from 'content-type';
import { channelSet } from '../channel/channel-set';
import { type HashAlgorithm, SignatureType } from '../crypto';
import { createNode, type Node } from '../data/create-node';
import { getAddressedNode } from '../data/get-node';
import { getModule } from '../modules/modules';
import { jobWorker } from '../worker/worker.module';

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

/**
 * Gets the identity from the active keyring of the protocol instance.
 *
 * @param {string} identityID The ID of the identity.
 * @param {string} [instanceID] A particular protocol instance ID can be used if using multiple
 *   protocol instances.
 * @returns {Promise<Identity>} A promise that resolves with the identity.
 */
export async function getIdentity(identityID: string, instanceID?: string) {
  const address = await new Promise<Uint8Array>((resolve) => {
    getModule(jobWorker, instanceID).postToOne(
      { action: 'identity.get', payload: identityID },
      (result) => resolve(result.payload),
    );
  });

  const identity = ((await getModule(getAddressedNode, instanceID)(address)) ??
    getModule(createNode, instanceID)()) as Identity;

  identity.address = address;
  identity.id = identityID;

  identity.push = pushIdentityNode.bind([identity, instanceID]);

  identity.signature = derived(() => {
    return identity.hash().then((hash) => {
      return new Promise<Uint8Array>((resolve) => {
        getModule(jobWorker, instanceID).postToOne(
          { action: 'identity.sign', payload: { identityID, hash } },
          ({ payload }) => {
            resolve(payload);
          },
        );
      });
    });
  });

  return identity;
}

/** This function is bound and attached to the `Identity`, overriding the base `node.push` function. */
async function pushIdentityNode(this: [Identity, instanceID?: string]) {
  await tick();
  const wrappedNode = getModule(createNode, this[1])()
    .setHashAlg(this[0].hashAlg())
    .setMediaType('application/lb-data')
    .setValue({
      type: SignatureType.ECDSA,
      hash: await this[0].hash(),
      mediaType: format(this[0].mediaType()),
      metadata: await this[0].signature(),
      payload: this[0].payload(),
    });
  const setAddressedHashPromise = wrappedNode.hash().then((hash) => {
    return Promise.all(
      [...getModule(channelSet, this[1])].map((channel) => {
        return channel.setAddressedNodeHash(this[0].address, hash);
      }),
    );
  });
  await Promise.all([wrappedNode.push(), setAddressedHashPromise]);
  return this[0];
}
