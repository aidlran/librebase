import type { ReadableSignal, Subscriber } from './to-read-only-signal.js';

export type Updater<T> = (currentValue: T) => T;

export interface WritableSignal<T> extends ReadableSignal<T> {
  set: (newValue: T) => void;
  update: (updater: Updater<T>) => void;
}

// TODO: process in batched ticks in microtask queue

export const createSignal = <T>(initialValue: T): WritableSignal<T> => {
  let currentValue = initialValue;
  const signal = () => currentValue;
  const subscribers = new Set<Subscriber<T>>();

  signal.set = (newValue: T) => {
    currentValue = newValue;
    subscribers.forEach((subscriber) => subscriber(currentValue));
  };

  signal.update = (updater: Updater<T>) => {
    signal.set(updater(currentValue));
  };

  signal.subscribe = (subscriber: Subscriber<T>) => {
    subscribers.add(subscriber);
    subscriber(currentValue);
    return () => subscribers.delete(subscriber);
  };

  return signal;
};
