import type { Signal } from './create-signal.js';

export type Subscriber<T> = (newValue: T) => unknown;

export interface ReadOnlySignal<T> {
  (): T;
  subscribe: (subscriber: Subscriber<T>) => () => void;
}

export const toReadOnlySignal = <T>(signal: Signal<T>): ReadOnlySignal<T> => {
  const readonly = () => signal();
  readonly.subscribe = signal.subscribe;
  return readonly;
};
