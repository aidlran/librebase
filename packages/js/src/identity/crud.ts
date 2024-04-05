import { parse, type MediaType, format } from 'content-type';
import { base58 } from '../buffer';
import { getChannels, queryChannelsAsync, queryChannelsSync } from '../channel';
import { decodeWithCodec, getCodec } from '../codec';
import { getModule } from '../modules/modules';
import { parseObject, putObject, type PutOptions } from '../object';
import type { WrapResult } from '../worker/types';
import { jobWorker } from '../worker/worker.module';
import { isWrap, WrapType, type WrapValue } from '../wrap';

// TODO: separate address hash CRUD module

export async function getIdentityValue(address: string | ArrayBuffer, instanceID?: string) {
  const addressBytes = typeof address === 'string' ? base58.decode(address) : address;
  const channels = getChannels(instanceID);
  const hash = await queryChannelsSync(channels, (channel) => {
    if (channel.getAddressHash) {
      return channel.getAddressHash(addressBytes);
    }
  });
  if (hash) {
    return queryChannelsSync(channels, async (channel) => {
      if (channel.getObject) {
        const objectResult = await channel.getObject(hash);
        if (objectResult) {
          const [, mediaType, payload] = parseObject(new Uint8Array(objectResult));
          const value = decodeWithCodec(payload, parse(mediaType), instanceID) as WrapValue;
          // It must be a signature wrap that has been signed by the address
          if (
            isWrap(value) &&
            value.type === WrapType.ECDSA &&
            value.metadata.publicKey === addressBytes
          ) {
            return value;
          }
        }
      }
    });
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
  const mediaTypeObj = typeof mediaType === 'string' ? parse(mediaType) : mediaType;
  const codec = getCodec(mediaTypeObj, options?.instanceID);
  let payload = codec.encode(value, mediaTypeObj);
  const addressBytes =
    typeof address === 'string' ? base58.decode(address) : new Uint8Array(address);

  const jsonMediaType = { type: 'application/json' };
  const jsonEncoder = getCodec(jsonMediaType, options?.instanceID);

  if (options?.encrypt) {
    const encryptWrapValue = (await new Promise<WrapResult>((resolve) => {
      getModule(jobWorker, options?.instanceID).postToOne(
        {
          action: 'wrap',
          payload: { type: WrapType.Encrypt, metadata: { pubKey: addressBytes }, payload },
        },
        (response) => {
          resolve(response.payload);
        },
      );
    })) as WrapValue;
    encryptWrapValue.mediaType = format(mediaTypeObj);
    payload = jsonEncoder.encode(encryptWrapValue, jsonMediaType);
  }

  const signedWrapValue = (await new Promise<WrapResult>((resolve) => {
    getModule(jobWorker, options?.instanceID).postToOne(
      { action: 'wrap', payload: { type: WrapType.ECDSA, metadata: addressBytes, payload } },
      (response) => {
        resolve(response.payload);
      },
    );
  })) as WrapValue;
  signedWrapValue.mediaType = format(mediaTypeObj);

  const hash = await putObject(signedWrapValue, jsonMediaType);

  await queryChannelsAsync(getChannels(options?.instanceID), (channel) => {
    if (channel.setAddressHash) {
      return channel.setAddressHash(addressBytes, hash.toBytes());
    }
  });
  return hash;
}
