import type { CreateKeyringRequest } from './create-keyring';

export interface ImportKeyringRequest<T = unknown> extends CreateKeyringRequest<T> {
  /** The mnemonic sentence. */
  mnemonic: string;
}
