import type { Action } from './action';
import type * as Payload from './payload/index';

/** Discriminated union that defines the result payloads for each action. */
export type Result<T extends Action> = {
  action: T;
  // TODO: isolate these only to rejected promises
  error?: string;
  ok: boolean;
} & (
  | { action: 'session.clear' }
  | { action: 'session.create'; payload: Payload.CreateSessionResult }
  | { action: 'session.import'; payload: Payload.ImportSessionResult }
  | { action: 'session.load'; payload: Payload.LoadSessionResult }
);
