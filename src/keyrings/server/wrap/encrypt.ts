import { Base58 } from '../../../internal/encoding.js';
import type { WrapConfig, WrapModule, WrapValue } from '../../../wraps/index.js';
import { findPrivateKey } from '../identity.js';

export interface EncryptWrapMetadata {
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
  /** A passphrase to use for key derivation. */
  passphrase?: string;
  /** The public key of the key pair to use for key derivation. */
  pubKey?: Uint8Array;
  /** The key derivation salt. */
  salt: Uint8Array;
}

export type EncryptWrapConfig = WrapConfig<'encrypt', Partial<EncryptWrapMetadata>>;
export type EncryptWrapValue = WrapValue<'encrypt', EncryptWrapMetadata>;

export const defaultMetadata = {
  encAlg: 'AES-GCM',
  hashAlg: 'SHA-256',
  iterations: 100000,
  kdf: 'PBKDF2',
} satisfies Partial<EncryptWrapMetadata>;

export const EncryptWrapSchema = {
  key: 'encrypt',
  unwrap: async (config) => [
    await decrypt(config.payload, config.metadata),
    sanitizeMetadata(config.metadata),
  ],
  wrap: (config) => encrypt(config.payload, config.metadata),
} satisfies WrapModule<Partial<EncryptWrapMetadata>, EncryptWrapMetadata>;

export function buildMetadata(metadata: Partial<EncryptWrapMetadata>) {
  return {
    encAlg: metadata.encAlg ?? defaultMetadata.encAlg,
    hashAlg: metadata.hashAlg ?? defaultMetadata.hashAlg,
    iterations: metadata.iterations ?? defaultMetadata.iterations,
    iv: metadata.iv ?? crypto.getRandomValues(new Uint8Array(12)),
    kdf: metadata.kdf ?? defaultMetadata.kdf,
    passphrase: metadata.passphrase,
    pubKey: metadata.pubKey,
    salt: metadata.salt ?? crypto.getRandomValues(new Uint8Array(16)),
  };
}

export function sanitizeMetadata<T extends Partial<EncryptWrapMetadata>>(
  metadata: T,
): Omit<T, 'passphrase'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passphrase, ...sanitized } = metadata;
  return sanitized;
}

export async function deriveKey(metadata: EncryptWrapMetadata) {
  let kdInput: Uint8Array;
  if (metadata.passphrase) {
    kdInput = new TextEncoder().encode(metadata.passphrase);
  } else if (metadata.pubKey) {
    kdInput = await findPrivateKey(
      typeof metadata.pubKey === 'string' ? Base58.decode(metadata.pubKey) : metadata.pubKey,
    );
  } else {
    throw new TypeError('No key derivation input was provided');
  }

  return crypto.subtle.deriveKey(
    {
      name: metadata.kdf,
      hash: metadata.hashAlg,
      iterations: metadata.iterations,
      salt: metadata.salt,
    },
    await crypto.subtle.importKey('raw', kdInput, metadata.kdf, false, ['deriveKey']),
    { name: metadata.encAlg, length: 256 },
    false,
    ['decrypt', 'encrypt'],
  );
}

export async function decrypt(value: Uint8Array, metadata: EncryptWrapMetadata) {
  return new Uint8Array(
    await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: metadata.iv,
      },
      await deriveKey(metadata),
      value,
    ),
  );
}

export async function encrypt(
  value: Uint8Array,
  metadata: Partial<EncryptWrapMetadata>,
): Promise<[Uint8Array, EncryptWrapMetadata]> {
  const builtMetadata = buildMetadata(metadata);
  return [
    new Uint8Array(
      await crypto.subtle.encrypt(
        { name: builtMetadata.encAlg, iv: builtMetadata.iv },
        await deriveKey(builtMetadata),
        value,
      ),
    ),
    sanitizeMetadata(builtMetadata),
  ];
}
