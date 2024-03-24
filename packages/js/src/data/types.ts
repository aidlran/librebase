import type { SignatureType } from '../crypto/sign/types';

export type WrapValue = {
  type: SignatureType;
  /** The hash of the unwrapped payload. */
  hash: Uint8Array;
  /** The media type of the unwrapped payload. */
  mediaType: string;
  /** The wrapped payload. */
  payload: Uint8Array;
} & WrapValueUnion;

export interface WrapValueUnion {
  type: SignatureType.ECDSA;

  metadata: {
    publicKey: Uint8Array;
    signature: Uint8Array;
  };
}
