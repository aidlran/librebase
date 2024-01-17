import { queueUniqueMicrotask } from '../../microtask/function/queue-unique-microtask';
import type { ReadableSignal } from '../types';
import { createSignal } from './create-signal';
import { toReadOnlySignal } from './to-read-only-signal';

type InferredArgs<T extends ReadableSignal<unknown>[]> = {
  [K in keyof T]: ReturnType<T[K] extends ReadableSignal<infer U> ? ReadableSignal<U> : never>;
};

/**
 * Creates a derived signal, which is a special `ReadableSignal` where the value is automatically
 * derived from other signal(s).
 *
 * @param dependencies An array of the signal(s) needed to compute the value. Whenever any one of
 *   these signals push a new value, this signal will re-compute and push a new value too. Note that
 *   you may even use another derived signal as a dependency, however exercise caution as
 *   introducing circular dependencies will freeze your program because there is not yet any
 *   mechnanism to detect them (TODO!)
 * @param callback A callback, called whenever the signal needs re-calculating, that accepts a
 *   mapped version of the values of the signals given in `dependencies` array and returns the
 *   calculated value of the derived signal. When depending on multiple other signals with varying
 *   generic types, you will need to manually narrow the type. This is because the inferred value
 *   type becomes a union of all possible generic types (TODO!)
 */
export const createDerived = <TOutput, TInputs extends ReadableSignal<unknown>[]>(
  dependencies: TInputs,
  callback: (...args: InferredArgs<TInputs>) => TOutput,
): ReadableSignal<TOutput> => {
  const signal = createSignal(callback(...(dependencies.map((d) => d()) as InferredArgs<TInputs>)));

  const compute = () => {
    const newValue = callback(...(dependencies.map((d) => d()) as InferredArgs<TInputs>));
    if (signal() !== newValue) {
      signal.set(newValue);
    }
  };

  for (const signal of dependencies) {
    signal.subscribe(() => queueUniqueMicrotask(compute));
  }

  return toReadOnlySignal(signal);

  /**
   * TODO: to make more efficient, while no one is listening, don't compute and unsubscribe from
   * dependencies. Don't notify unless value actually changes.
   */
};
