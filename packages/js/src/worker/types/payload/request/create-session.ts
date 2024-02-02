export interface CreateSessionRequest<T = unknown> {
  /** The passphrase used to protect the session payload. */
  passphrase: string;

  /** Optional arbitrary metadata to store unencrypted alongside the session. */
  metadata?: T;
}
