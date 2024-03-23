import type { Action } from './action';
import type * as Payload from './payload/index';

/** Discriminated union that defines the result payloads for each action. */
export type Result<T extends Action> = {
  action: T;
  // TODO: isolate these only to rejected promises
  error?: string;
  ok: boolean;
} & (
  | { action: 'identity.get'; payload: Uint8Array }
  | { action: 'keyring.clear' }
  | { action: 'keyring.create'; payload: Payload.CreateKeyringResult }
  | { action: 'keyring.import'; payload: Payload.ImportKeyringResult }
  | { action: 'keyring.load'; payload: Payload.LoadKeyringResult }
  | { action: 'sign'; payload: Uint8Array }
  | { action: 'verify'; payload: boolean }
);
