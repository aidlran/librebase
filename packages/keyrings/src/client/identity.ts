import { Identifier, queryChannelsSync } from '@astrobase/core';
import {
  FS,
  decodeWithCodec,
  parseFileContent,
  putFile,
  type PutOptions,
} from '@astrobase/core/immutable';
import { Base58 } from '@astrobase/core/internal';
import { client } from '@astrobase/core/rpc/client';
import { isWrap, wrap, type ECDSAWrappedMetadata, type WrapValue } from '@astrobase/core/wraps';
import type { MediaType } from 'content-type';
import { getAddressHash, setAddressHash } from './address.js';

// TODO: separate address hash CRUD module

export function getIdentityAddress(identityID: string, instanceID?: string) {
  return client.postToOne('identity.get', identityID, instanceID);
}

export async function getIdentityValue(address: string | Uint8Array, instanceID?: string) {
  const hash = await getAddressHash(address, instanceID);
  if (hash) {
    return queryChannelsSync(async (channel) => {
      if (channel.get) {
        const objectResult = await channel.get(new Identifier(FS.key, hash.toBytes()));
        if (objectResult) {
          const [, mediaType, payload] = parseFileContent(new Uint8Array(objectResult));
          const value = await decodeWithCodec<WrapValue>(payload, mediaType, instanceID);
          // It must be a signature wrap that has been signed by the address
          if (
            isWrap(value) &&
            value.$ === 'wrap:ecdsa' &&
            (value.m as ECDSAWrappedMetadata).pub ===
              (typeof address === 'string' ? address : Base58.encode(address))
          ) {
            return value;
          }
        }
      }
    }, instanceID);
  }
}

export interface IdentityPutOptions extends PutOptions {
  /**
   * Whether to encrypt the payload with a default encryption.
   *
   * @todo Allow greater configuration. For now you can omit this and simply encrypt yourself.
   */
  encrypt?: boolean;
}

export async function putIdentity(
  address: string | ArrayBuffer,
  value: unknown,
  mediaType: string | MediaType,
  options?: IdentityPutOptions,
) {
  const pubKey = typeof address === 'string' ? Base58.decode(address) : new Uint8Array(address);
  if (options?.encrypt) {
    value = await wrap({ type: 'encrypt', metadata: { pubKey }, value, mediaType });
  }
  value = await wrap({ type: 'ecdsa', metadata: pubKey, value, mediaType: 'application/json' });
  const hash = await putFile(value, 'application/json');
  await setAddressHash(pubKey, hash);
  return hash;
}
