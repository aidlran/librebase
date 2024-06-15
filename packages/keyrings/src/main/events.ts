import type { Keyring } from './keyring.js';

export const ACTIVE_KEYRING_CHANGE = Symbol();

export type Topic = typeof ACTIVE_KEYRING_CHANGE;
export type Listener<T> = (value: T, instanceID?: string) => unknown;

const listeners = {
  [ACTIVE_KEYRING_CHANGE]: [] as Listener<Keyring | null>[],
} as const;

export function emit<T extends Topic>(
  topic: T,
  value: Parameters<(typeof listeners)[T][number]>[0],
  instanceID?: string,
) {
  for (const fn of listeners[topic]) {
    fn(value, instanceID);
  }
}

export function subscribe<T extends Topic>(topic: T, listener: (typeof listeners)[T][number]) {
  listeners[topic].push(listener);
}
