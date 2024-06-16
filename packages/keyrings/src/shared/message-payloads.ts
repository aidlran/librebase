import type { CIDLike, Hash } from '@librebase/fs';

export interface CreateKeyringRequest<T = unknown> {
  /** The passphrase used to protect the keyring payload. */
  passphrase: string;
  /** Optional arbitrary metadata to store unencrypted alongside the keyring. */
  metadata?: T;
  /** The wordlist to use for the mnemonic. */
  wordlist: string[];
}

export interface ImportKeyringRequest<T = unknown> extends CreateKeyringRequest<T> {
  /** The mnemonic sentence. */
  mnemonic: string;
  /** The wordlist to use for the mnemonic. */
  wordlist: string[];
}

export interface LoadKeyringRequest {
  /** The CID of the target keyring. */
  id: CIDLike;
  /** The passphrase needed to decrypt the keyring. */
  passphrase: string;
  /** The wordlist to use for the mnemonic. */
  wordlist: string[];
}

export interface CreateKeyringResult {
  /** The BIP39 mnemonic (recovery phrase) of the created keyring. */
  mnemonic: string;
  /** The CID of the created keyring. */
  id: Hash;
}

/** The CID of the imported keyring. */
export type ImportKeyringResult = Hash;

/** The optional arbitrary metadata stored associated with the keyring. */
export type LoadKeyringResult<T = unknown> = T;
