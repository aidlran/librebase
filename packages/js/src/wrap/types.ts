import type { HashAlgorithm } from '../hash/algorithm.enum';
import type { WrapType } from './enum';

export type WrapConfig = {
  hashAlg?: HashAlgorithm;
  type: WrapType;
} & {
  type: WrapType.ECDSA;
  /** The publicKey */
  metadata: Uint8Array;
};

export type WrapValue = {
  type: WrapType;
  /** The hash of the unwrapped payload. */
  hash: Uint8Array;
  /** The media type of the unwrapped payload. */
  mediaType: string;
  /** The wrapped payload. */
  payload: Uint8Array;
} & {
  type: WrapType.ECDSA;
  metadata: {
    publicKey: Uint8Array;
    signature: Uint8Array;
  };
};
