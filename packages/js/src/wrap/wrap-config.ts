import type { MediaType } from 'content-type';
import type { HashAlgorithm } from '../hash';
import type { WrapType } from './wrap-type';

interface BaseWrapConfig {
  value: unknown;
  mediaType: MediaType | string;
  hashAlg?: HashAlgorithm;
}

export interface ECDSAWrapConfig extends BaseWrapConfig {
  $: 'wrap:ecdsa';
  /** The public key. */
  metadata: Uint8Array | string;
}

export interface EncryptWrapConfig extends BaseWrapConfig {
  $: 'wrap:encrypt';
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

export type WrapConfig<T extends WrapType = WrapType> = { $: `wrap:${T}` } & (
  | ECDSAWrapConfig
  | EncryptWrapConfig
);

export function wrap<T extends WrapType>(
  value: unknown,
  mediaType: MediaType | string,
  wrapType: T,
  metadata: WrapConfig<T>['metadata'],
  hashAlg?: HashAlgorithm,
) {
  return {
    $: `wrap:${wrapType}`,
    value,
    mediaType,
    metadata,
    hashAlg,
  } as WrapConfig<T>;
}
