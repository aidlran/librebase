import type { Action } from './action';
import type * as Payload from './payload/index';

/** Discriminated union that defines the request payloads for each action. */
export type Request<T extends Action> = {
  action: T;
} & (
  | { action: 'identity.get'; payload: string }
  | { action: 'keyring.clear' }
  | { action: 'keyring.create'; payload: Payload.CreateKeyringRequest }
  | { action: 'keyring.import'; payload: Payload.ImportKeyringRequest }
  | { action: 'keyring.load'; payload: Payload.LoadKeyringRequest }
);
