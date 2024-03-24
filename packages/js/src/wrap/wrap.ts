import { hash, HashAlgorithm } from '../crypto/hash';
import type { Injector } from '../modules/modules';
import { jobWorker } from '../worker/worker.module';
import { WrapType } from './enum';
import type { WrapConfig } from './types';

export function wrap(this: Injector) {
  return async (config: WrapConfig, payload: Uint8Array) => {
    const hashAlg = config.hashAlg ?? HashAlgorithm.SHA256;
    const payloadHash = new Uint8Array(await hash(hashAlg, payload));

    switch (config.type) {
      case WrapType.ECDSA: {
        const signature = await new Promise((resolve) => {
          this(jobWorker).postToOne(
            {
              action: 'sign',
              payload: { publicKey: config.metadata, hash: payloadHash },
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
          hash: new Uint8Array([hashAlg, ...payloadHash]),
        };
      }
      default: {
        throw new Error('Unsupported wrap type');
      }
    }
  };
}
