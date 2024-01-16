export type Subscriber<T> = (newValue: T) => unknown;

export type Updater<T> = (currentValue: T) => T;

export interface ReadableSignal<T> {
  (): T;
  subscribe: (subscriber: Subscriber<T>) => () => void;
}

export interface WritableSignal<T> extends ReadableSignal<T> {
  set: (newValue: T) => void;
  update: (updater: Updater<T>) => void;
}
