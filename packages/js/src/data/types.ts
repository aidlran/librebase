import type { SignatureType } from '../crypto/sign/types';

export interface LBDataValue {
  type: SignatureType;
  hash: Uint8Array;
  mediaType: string;
  metadata: Uint8Array;
  payload: Uint8Array;
}
