import type { WrapConfig, WrapValue } from '@librebase/wraps';
import type * as Payload from './payloads';

export type Action = PostToAllAction | PostToOneAction;

export type PostToAllAction = 'keyring.clear' | 'keyring.load';

export type PostToOneAction =
  | 'identity.get'
  | 'keyring.create'
  | 'keyring.import'
  | 'unwrap'
  | 'wrap';

export type Request<T extends Action> = {
  action: T;
  instanceID?: string;
} & (
  | { action: 'identity.get'; payload: string }
  | { action: 'keyring.clear' }
  | { action: 'keyring.create'; payload: Payload.CreateKeyringRequest }
  | { action: 'keyring.import'; payload: Payload.ImportKeyringRequest }
  | { action: 'keyring.load'; payload: Payload.LoadKeyringRequest }
  | { action: 'unwrap'; payload: WrapValue }
  | { action: 'wrap'; payload: WrapConfig }
);

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
  | { action: 'unwrap'; payload: WrapConfig }
  | { action: 'wrap'; payload: WrapValue }
);

export type Job<T extends Action = Action> = Request<T> & {
  jobID: number;
};
