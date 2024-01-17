import { queueUniqueMicrotask } from '../../microtask/function/queue-unique-microtask';
import type { ReadableSignal } from '../types';
import { createSignal } from './create-signal';
import { toReadOnlySignal } from './to-read-only-signal';

/**
 * Creates a derived signal, which is a special `ReadableSignal` where the value is automatically
 * derived from other signal(s).
 *
 * @param dependencies An array of the signal(s) needed to compute the value. Whenever any one of
 *   these signals push a new value, this signal will re-compute and push a new value too. Note that
 *   you may even use another derived signal as a dependency, however exercise caution as
 *   introducing circular dependencies will freeze your program because there is not yet any
 *   mechnanism to detect them (TODO!)
 * @param callback A callback, called whenever the signal needs re-calculating, that returns the
 *   calculated value of the derived signal.
 */
export const createDerived = <T>(
  dependencies: ReadableSignal<unknown>[],
  callback: () => T,
): ReadableSignal<T> => {
  const signal = createSignal(callback());

  const compute = () => {
    const newValue = callback();
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
