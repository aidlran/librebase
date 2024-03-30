import { hash } from '../hash';
import type { Injector } from '../modules/modules';
import { jobWorker } from '../worker/worker.module';
import { WrapType } from './enum';
import type { WrapConfig, WrapValue } from './types';

export function unwrap(this: Injector) {
  return async (wrap: WrapValue): Promise<[Uint8Array, WrapConfig]> => {
    switch (wrap.type) {
      case WrapType.ECDSA: {
        const config: WrapConfig = {
          hashAlg: wrap.hash[0],
          metadata: wrap.metadata.publicKey,
          type: wrap.type,
        };
        const payload = wrap.payload;
        const payloadHash = await hash(wrap.hash[0], payload);
        const valid = await new Promise<boolean>((resolve) => {
          this(jobWorker).postToOne(
            {
              action: 'verify',
              payload: {
                hash: payloadHash.value,
                ...wrap.metadata,
              },
            },
            ({ payload }) => resolve(payload),
          );
        });
        if (!valid) {
          throw new Error('Invalid signature');
        }
        return [payload, config];
      }
    }
  };
}
