import type { ChannelDriver } from '../src/core/channels.js';

function throwError() {
  throw new Error();
}

export const fakeErrorDriver: Required<ChannelDriver> = {
  delete: throwError,
  get: throwError,
  put: throwError,
};

function returnVoid() {}
export const fakeVoidDriver: Required<ChannelDriver> = {
  delete: returnVoid,
  get: returnVoid,
  put: returnVoid,
};

export const fakeValidDriver: Required<ChannelDriver> = {
  delete: returnVoid,
  get: () => new ArrayBuffer(0),
  put: returnVoid,
};

function returnDelayed<T>(this: T) {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(this);
    }, 5000);
  });
}

export const fakeDelayedDriver: Required<ChannelDriver> = {
  delete: returnDelayed,
  get: returnDelayed.bind(new ArrayBuffer(0)),
  put: returnDelayed,
};
