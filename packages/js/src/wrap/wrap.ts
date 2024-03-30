import { HashAlgorithm, hash } from '../hash';
import type { Injector } from '../modules/modules';
import { jobWorker } from '../worker/worker.module';
import { WrapType } from './enum';
import type { WrapConfig, WrapValue } from './types';

export function wrap(this: Injector) {
  return async (config: WrapConfig, payload: Uint8Array): Promise<Omit<WrapValue, 'mediaType'>> => {
    const hashAlg = config.hashAlg ?? HashAlgorithm.SHA256;
    const payloadHash = await hash(hashAlg, payload);

    switch (config.type) {
      case WrapType.ECDSA: {
        const signature = await new Promise<Uint8Array>((resolve) => {
          this(jobWorker).postToOne(
            {
              action: 'sign',
              payload: { publicKey: config.metadata, hash: payloadHash.value },
            },
            ({ payload }) => resolve(payload),
          );
        });
        return {
          metadata: {
            publicKey: config.metadata,
            signature,
          },
          type: config.type,
          payload,
          hash: payloadHash.toBytes(),
        };
      }
      default: {
        throw new Error('Unsupported wrap type');
      }
    }
  };
}
