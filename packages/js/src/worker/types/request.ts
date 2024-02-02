import type { Action } from './action';
import type * as Payload from './payload/index';

/** Discriminated union that defines the request payloads for each action. */
export type Request<T extends Action> = {
  action: T;
} & (
  | { action: 'session.clear' }
  | { action: 'session.create'; payload: Payload.CreateSessionRequest }
  | { action: 'session.import'; payload: Payload.ImportSessionRequest }
  | { action: 'session.load'; payload: Payload.LoadSessionRequest }
);
