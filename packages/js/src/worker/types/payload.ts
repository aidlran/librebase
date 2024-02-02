import type { Action } from './action';

export interface Payload<A extends Action, T = void> {
  action: A;
  payload: T;
}
