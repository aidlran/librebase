export interface LoadKeyringResult<T = unknown> {
  /** The ID of the session. */
  id: number;

  /** The optional arbitrary metadata stored associated with the session. */
  metadata?: T;
}
