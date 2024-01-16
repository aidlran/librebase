import type { Subscriber, Updater, WritableSignal } from '../types';

export const constructCreateSignal = (addToNotifyQueue: (item: () => void) => void) => {
  return <T>(initialValue: T): WritableSignal<T> => {
    let currentValue = initialValue;
    const signal = () => currentValue;
    const subscribers = new Set<Subscriber<T>>();

    const push = () => subscribers.forEach((subscriber) => subscriber(currentValue));

    signal.set = (newValue: T) => {
      currentValue = newValue;
      addToNotifyQueue(push);
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
};
