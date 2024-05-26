import { Identifier, queryChannelsSync } from '@librebase/core';
import { Base58, getModule } from '@librebase/core/internal';
import { FS, decodeWithCodec, parseFileContent, putFile, type PutOptions } from '@librebase/fs';
import { wrap, type WrapValue } from '@librebase/wraps';
import { isWrap } from '@librebase/wraps/middleware';
import type { ECDSAWrappedMetadata } from '@librebase/wraps/module';
import type { MediaType } from 'content-type';
import { jobWorker } from '../worker/worker.module';
import { getAddressHash, setAddressHash } from './address';

// TODO: separate address hash CRUD module

export function getIdentityAddress(identityID: string, instanceID?: string) {
  return new Promise<Uint8Array>((resolve) => {
    getModule(jobWorker, instanceID).postToOne(
      { action: 'identity.get', payload: identityID },
      ({ payload }) => {
        resolve(payload);
      },
    );
  });
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
