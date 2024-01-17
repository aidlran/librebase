import { queueUniqueMicrotask } from '../../microtask/function/queue-unique-microtask';
import type { Subscriber, WritableSignal } from '../types';

export const createSignal = <T>(initialValue: T): WritableSignal<T> => {
  let currentValue = initialValue;
  const signal = () => currentValue;
  const subscribers = new Set<Subscriber<T>>();

  const push = () => subscribers.forEach((subscriber) => subscriber(currentValue));

  signal.set = (newValue: T) => {
    currentValue = newValue;
    // TODO: to make even more efficient: notify computed stores first,
    // have them calculate, then notify all subscribers in one pass
    queueUniqueMicrotask(push);
  };

  signal.subscribe = (subscriber: Subscriber<T>) => {
    subscribers.add(subscriber);
    subscriber(currentValue);
    return () => subscribers.delete(subscriber);
  };

  return signal;
};
