import type { Subscriber, WritableSignal } from '../types';

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

    signal.subscribe = (subscriber: Subscriber<T>) => {
      subscribers.add(subscriber);
      subscriber(currentValue);
      return () => subscribers.delete(subscriber);
    };

    return signal;
  };
};
