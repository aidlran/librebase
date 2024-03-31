import type { HashBytes } from '../hash';
import type { WrapType } from './enum';

interface BaseWrapValue {
  /** The hash of the unwrapped payload. */
  hash: HashBytes;
  /** The media type of the unwrapped payload. */
  mediaType: string;
  /** The wrapped payload. */
  payload: Uint8Array;
}

export interface ECDSAWrapValue extends BaseWrapValue {
  type: typeof WrapType.ECDSA;
  metadata: {
    publicKey: Uint8Array;
    signature: Uint8Array;
  };
}

export interface EncryptWrapValue extends BaseWrapValue {
  type: typeof WrapType.Encrypt;
  metadata: {
    /** The encryption algorithm. */
    encAlg: 'AES-GCM';
    /** The hashing algorithm used for key derivation. */
    hashAlg: 'SHA-256';
    /** The number of iterations for key derivation. */
    iterations: number;
    /** Initialization vector or nonce. */
    iv: Uint8Array;
    /** The key derivation function identifier. */
    kdf: 'PBKDF2';
    /** The public key of the key pair to use for key derivation. */
    pubKey: Uint8Array;
    /** The key derivation salt. */
    salt: Uint8Array;
  };
}

export type WrapValue = ECDSAWrapValue | EncryptWrapValue;
