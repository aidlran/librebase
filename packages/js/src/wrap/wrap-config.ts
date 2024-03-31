import type { HashAlgorithm } from '../hash';
import type { WrapType } from './enum';

interface BaseWrapConfig {
  hashAlg?: HashAlgorithm;
}

export interface ECDSAWrapConfig extends BaseWrapConfig {
  type: typeof WrapType.ECDSA;
  /** The public key. */
  metadata: Uint8Array;
}

export interface EncryptWrapConfig extends BaseWrapConfig {
  type: typeof WrapType.Encrypt;
  metadata: {
    /** The encryption algorithm. */
    encAlg?: 'AES-GCM';
    /** The hashing algorithm used for key derivation. */
    hashAlg?: 'SHA-256';
    /** The number of iterations for key derivation. */
    iterations?: number;
    /** Initialization vector or nonce. */
    iv?: Uint8Array;
    /** The key derivation function identifier. */
    kdf?: 'PBKDF2';
    /** The public key of the key pair to use for key derivation. */
    pubKey: Uint8Array;
    /** The key derivation salt. */
    salt?: Uint8Array;
  };
}

export type WrapConfig = ECDSAWrapConfig | EncryptWrapConfig;
