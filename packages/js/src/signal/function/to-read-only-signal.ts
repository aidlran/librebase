import type { WritableSignal } from './create-signal.js';

export type Subscriber<T> = (newValue: T) => unknown;

export interface ReadableSignal<T> {
  (): T;
  subscribe: (subscriber: Subscriber<T>) => () => void;
}

export const toReadOnlySignal = <T>(signal: WritableSignal<T>): ReadableSignal<T> => {
  const readonly = () => signal();
  readonly.subscribe = signal.subscribe;
  return readonly;
};
