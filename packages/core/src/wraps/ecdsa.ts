import { verify } from '@noble/secp256k1';
import { Base58 } from '../internal/encoding.js';
import type { WrapModule } from './wraps.js';

export type ECDSAUnwrappedMetadata = Uint8Array;

export interface ECDSAWrappedMetadata {
  /** Base 58 encoded public key. */
  pub: string;
  /** Base 64 encoded signature. */
  sig: string;
}

export const ECDSAWrapModule: WrapModule<ECDSAUnwrappedMetadata, ECDSAWrappedMetadata> = {
  key: 'ecdsa',
  unwrap({ hash, metadata, payload }) {
    if (!verify(metadata.sig, hash.toBytes(), metadata.pub)) {
      throw new Error('ECDSA signature failed to verify');
    }
    return [payload, Base58.decode(metadata.pub)];
  },
};
