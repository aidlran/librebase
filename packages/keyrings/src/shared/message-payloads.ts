export interface CreateKeyringRequest<T = unknown> {
  /** The passphrase used to protect the session payload. */
  passphrase: string;
  /** Optional arbitrary metadata to store unencrypted alongside the session. */
  metadata?: T;
}

export interface ImportKeyringRequest<T = unknown> extends CreateKeyringRequest<T> {
  /** The mnemonic sentence. */
  mnemonic: string;
}

export interface LoadKeyringRequest {
  /** The ID of the target session. */
  id: number;
  /** The passphrase needed to decrypt the session. */
  passphrase: string;
}

export interface CreateKeyringResult {
  /** The BIP39 mnemonic (recovery phrase) of the created session. */
  mnemonic: string;
  /** The ID of the created session. */
  id: number;
}

export interface ImportKeyringResult {
  /** The ID of the imported session. */
  id: number;
}

export interface LoadKeyringResult<T = unknown> {
  /** The ID of the session. */
  id: number;
  /** The optional arbitrary metadata stored associated with the session. */
  metadata?: T;
}
