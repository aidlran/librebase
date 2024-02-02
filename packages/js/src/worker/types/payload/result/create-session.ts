export interface CreateSessionResult {
  /** The BIP39 mnemonic (recovery phrase) of the created session. */
  mnemonic: string;

  /** The ID of the created session. */
  id: number;
}
