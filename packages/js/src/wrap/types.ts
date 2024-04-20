import type { MediaType } from 'content-type';
import type { HashAlgorithm, HashBytes } from '../hash';

export type WrapType = 'ecdsa' | 'encrypt';

export interface WrapConfigMetadataMap {
  /** The public key. */
  ecdsa: Uint8Array;
  encrypt: {
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

export interface WrapConfig<T extends WrapType = WrapType> {
  wrapType: T;
  metadata: WrapConfigMetadataMap[T];
  /** The media type of the value. */
  mediaType: MediaType | string;
  /** The hashing algorithm to use. */
  hashAlg?: HashAlgorithm;
}

export interface WrapValueMetadataMap {
  ecdsa: {
    /** Base 58 encoded public key. */
    pub: string;
    /** Base 64 encoded signature. */
    sig: string;
  };
  encrypt: {
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

export interface WrapValue<T extends WrapType = WrapType> {
  $: `wrap:${T}`;
  meta: WrapValueMetadataMap[T];
  /** The hash of the unwrapped payload. */
  hash: HashBytes;
  /** The media type of the unwrapped payload. */
  mediaType: string;
  /** The wrapped payload. */
  payload: Uint8Array;
}
