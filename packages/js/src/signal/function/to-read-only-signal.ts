import type { ReadableSignal, WritableSignal } from '../types.js';

export const toReadOnlySignal = <T>(signal: WritableSignal<T>): ReadableSignal<T> => {
  const readonly = () => signal();
  readonly.subscribe = signal.subscribe;
  return readonly;
};
