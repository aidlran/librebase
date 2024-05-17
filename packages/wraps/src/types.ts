/** @deprecated */
export type WrapType = 'ecdsa' | 'encrypt';

/** @deprecated */
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

/** @deprecated */
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
