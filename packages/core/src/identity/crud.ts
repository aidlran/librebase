import { parse, type MediaType, format } from 'content-type';
import { getAddressHash, setAddressHash } from '../address';
import { base58 } from '../buffer';
import { queryChannelsSync } from '../channel';
import { decodeWithCodec, encodeWithCodec } from '../codec';
import { getModule } from '../modules/modules';
import { parseObject, putObject, type PutOptions } from '../object';
import type { WrapResult } from '../worker/types';
import { jobWorker } from '../worker/worker.module';
import { isWrap, type WrapValue } from '../wrap';

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
      if (channel.getObject) {
        const objectResult = await channel.getObject(hash.toBytes());
        if (objectResult) {
          const [, mediaType, payload] = parseObject(new Uint8Array(objectResult));
          const value = await decodeWithCodec<WrapValue>(payload, parse(mediaType), instanceID);
          // It must be a signature wrap that has been signed by the address
          if (
            isWrap(value) &&
            value.$ === 'wrap:ecdsa' &&
            (value as WrapValue<'ecdsa'>).meta.pub ===
              (typeof address === 'string' ? address : base58.encode(address))
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
  const addressBytes =
    typeof address === 'string' ? base58.decode(address) : new Uint8Array(address);
  const jsonMediaType = { type: 'application/json' };
  const mediaTypeObj = typeof mediaType === 'string' ? parse(mediaType) : mediaType;

  let payload = await encodeWithCodec(value, mediaTypeObj, options?.instanceID);

  if (options?.encrypt) {
    const encryptWrapValue = (await new Promise<WrapResult>((resolve) => {
      getModule(jobWorker, options?.instanceID).postToOne(
        {
          action: 'wrap',
          payload: { wrapType: 'encrypt', metadata: { pubKey: addressBytes }, payload },
        },
        (response) => {
          resolve(response.payload);
        },
      );
    })) as WrapValue;
    encryptWrapValue.mediaType = format(mediaTypeObj);
    payload = await encodeWithCodec(encryptWrapValue, jsonMediaType, options.instanceID);
  }

  const signedWrapValue = (await new Promise<WrapResult>((resolve) => {
    getModule(jobWorker, options?.instanceID).postToOne(
      { action: 'wrap', payload: { wrapType: 'ecdsa', metadata: addressBytes, payload } },
      (response) => {
        resolve(response.payload);
      },
    );
  })) as WrapValue;
  signedWrapValue.mediaType = format(mediaTypeObj);

  const hash = await putObject(signedWrapValue, jsonMediaType);
  await setAddressHash(addressBytes, hash);
  return hash;
}
