import type { CreateSessionRequest } from './create-session.js';

export interface ImportSessionRequest<T = unknown> extends CreateSessionRequest<T> {
  /** The mnemonic sentence. */
  mnemonic: string;
}
