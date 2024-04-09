import type { MediaType } from 'content-type';
import type { HashAlgorithm } from '../hash';
import type { WrapType } from './wrap-type';

interface BaseWrapConfig {
  /** The media type of the value. */
  mediaType: MediaType | string;
  /** The hashing algorithm to use. */
  hashAlg?: HashAlgorithm;
}

export interface ECDSAWrapConfig extends BaseWrapConfig {
  wrapType: 'ecdsa';
  /** The public key. */
  metadata: Uint8Array | string;
}

export interface EncryptWrapConfig extends BaseWrapConfig {
  wrapType: 'encrypt';
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
    pubKey: Uint8Array | string;
    /** The key derivation salt. */
    salt?: Uint8Array;
  };
}

export type WrapConfig<T extends WrapType = WrapType> = { wrapType: T } & (
  | ECDSAWrapConfig
  | EncryptWrapConfig
);
