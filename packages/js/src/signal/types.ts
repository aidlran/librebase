export type Subscriber<T> = (newValue: T) => unknown;

export interface ReadableSignal<T> {
  (): T;
  subscribe: (subscriber: Subscriber<T>) => () => void;
}

export interface WritableSignal<T> extends ReadableSignal<T> {
  set: (newValue: T) => void;
}
