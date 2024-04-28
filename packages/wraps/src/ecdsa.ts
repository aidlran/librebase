import { base58 } from '@librebase/core';
import { verify } from '@noble/secp256k1';
import type { WrapModule } from './wraps';

export type ECDSAUnwrappedMetadata = Uint8Array;

export interface ECDSAWrappedMetadata {
  /** Base 58 encoded public key. */
  pub: string;
  /** Base 64 encoded signature. */
  sig: string;
}

export const ECDSAWrapModule: WrapModule<ECDSAUnwrappedMetadata, ECDSAWrappedMetadata> = {
  canUnwrap: ['ecdsa'],
  unwrap({ hash, metadata, payload }) {
    if (!verify(metadata.sig, hash.toBytes(), metadata.pub)) {
      throw new Error('ECDSA signature failed to verify');
    }
    return [payload, base58.decode(metadata.pub)];
  },
};
