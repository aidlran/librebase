import type { Hash, HashAlgorithm } from '../hash';
import type { WrapType } from './enum';

export type WrapConfig = {
  hashAlg?: HashAlgorithm;
} & (
  | { type: typeof WrapType.AES }
  | {
      type: typeof WrapType.ECDSA;
      /** The publicKey */
      metadata: Uint8Array;
    }
);

export type WrapValue = BaseWrapValue & (AESWrapValue | ECDSAWrapValue);

interface BaseWrapValue {
  /** The hash of the unwrapped payload. */
  hash: Hash;
  /** The media type of the unwrapped payload. */
  mediaType: string;
  /** The wrapped payload. */
  payload: Uint8Array;
}

export interface AESWrapValue extends BaseWrapValue {
  type: typeof WrapType.AES;
}

export interface ECDSAWrapValue extends BaseWrapValue {
  type: typeof WrapType.ECDSA;
  metadata: {
    publicKey: Uint8Array;
    signature: Uint8Array;
  };
}
