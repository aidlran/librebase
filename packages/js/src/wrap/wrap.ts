import { format } from 'content-type';
import { base58 } from '../buffer';
import { encodeWithCodec } from '../codec';
import { HashAlgorithm, hash } from '../hash';
import { getModule } from '../modules/modules';
import type { WrapResult } from '../worker/types';
import { jobWorker } from '../worker/worker.module';
import type { WrapConfig } from './wrap-config';
import type { WrapType } from './wrap-type';
import type { WrapValue } from './wrap-value';

export async function wrap<T extends WrapType>(
  value: unknown,
  { hashAlg, mediaType, metadata, wrapType }: WrapConfig<T>,
  instanceID?: string,
): Promise<WrapValue<T>> {
  const unwrappedPayload = await encodeWithCodec(value, mediaType, instanceID);
  const unwrappedPayloadHash = await hash(hashAlg ?? HashAlgorithm.SHA256, unwrappedPayload);

  const result = await new Promise<WrapResult<T>>((resolve) => {
    getModule(jobWorker, instanceID).postToOne(
      {
        action: 'wrap',
        payload: {
          metadata,
          payload: unwrappedPayload,
          wrapType,
        },
      },
      ({ payload }) => {
        resolve(payload as WrapResult<T>);
      },
    );
  });

  const wrapValue: Partial<WrapValue> = {
    $: `wrap:${wrapType}` as WrapValue['$'],
    mediaType: typeof mediaType === 'string' ? mediaType : format(mediaType),
    hash: unwrappedPayloadHash.toBytes(),
  };

  if (wrapType === 'ecdsa') {
    const pubKey = metadata as WrapConfig<'ecdsa'>['metadata'];
    const publicKey = typeof pubKey === 'string' ? pubKey : base58.encode(pubKey);
    wrapValue.payload = unwrappedPayload;
    wrapValue.meta = {
      pub: publicKey,
      sig: result as WrapResult<'ecdsa'>,
    };
  } else if (wrapType === 'encrypt') {
    const { meta, payload } = result as WrapResult<'encrypt'>;
    wrapValue.meta = meta;
    wrapValue.payload = payload;
  } else {
    throw new TypeError('Unsupported wrap type: ' + wrapType);
  }

  return wrapValue as WrapValue<T>;
}
