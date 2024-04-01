/* eslint-disable @typescript-eslint/unbound-method */

import { derived, tick } from '@adamantjs/signals';
import type { MediaType } from 'content-type';
import { channelSet } from '../channel/channel-set';
import { base58 } from '../crypto';
import { createNode, type Node } from '../data/create-node';
import { getAddressedNode } from '../data/get-node';
import type { HashAlgorithm } from '../hash';
import { log } from '../logger/logger';
import { getModule } from '../modules/modules';
import { jobWorker } from '../worker/worker.module';
import { WrapType } from '../wrap/enum';

export interface Identity extends Node {
  id: string;
  publicKey: Uint8Array;
  push: () => Promise<Identity>;
  setHashAlg: (alg: HashAlgorithm) => Identity;
  setMediaType: (type: string | MediaType) => Identity;
  setPayload: (payload: Uint8Array) => Promise<Identity>;
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

  let wrappersAdded = false;
  let pushing = false;

  function appendWrappers() {
    if (!wrappersAdded) {
      identity.pushWrapper({ type: WrapType.ECDSA, metadata: publicKey });
      wrappersAdded = true;
    }
  }

  function removeWrappers() {
    if (wrappersAdded) {
      identity.popWrapper();
      wrappersAdded = false;
    }
  }

  identity.payload = derived(
    async function (this: () => Promise<Uint8Array>) {
      appendWrappers();
      const payload = await this();
      if (!pushing) removeWrappers();
      return payload;
    }.bind(identity.payload),
  );

  identity.push = async function (this: () => Promise<Identity>) {
    await tick();
    const setAddressedHashPromise = identity.hash().then((hash) => {
      log(undefined, 'Update identity data', {
        id: identity.id,
        address: base58.encode(identity.publicKey),
        hash: base58.encode(hash),
      });
      return Promise.all(
        [...getModule(channelSet, instanceID)].map((channel) => {
          return channel.setAddressedNodeHash(identity.publicKey, hash);
        }),
      );
    });
    appendWrappers();
    pushing = true;
    await Promise.all([this(), setAddressedHashPromise]);
    removeWrappers();
    return identity;
  }.bind(identity.push);

  return identity;
}
