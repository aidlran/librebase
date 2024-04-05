import type { ChannelDriver } from '../src/channel/types';

function throwError() {
  throw new Error();
}

export const fakeErrorDriver: Required<ChannelDriver> = {
  deleteObject: throwError,
  getObject: throwError,
  putObject: throwError,
  getAddressHash: throwError,
  setAddressHash: throwError,
  unsetAddressHash: throwError,
};

function returnVoid() {}
export const fakeVoidDriver: Required<ChannelDriver> = {
  deleteObject: returnVoid,
  getObject: returnVoid,
  putObject: returnVoid,
  getAddressHash: returnVoid,
  setAddressHash: returnVoid,
  unsetAddressHash: returnVoid,
};

export const fakeValidDriver: Required<ChannelDriver> = {
  deleteObject: returnVoid,
  getObject() {
    return new ArrayBuffer(0);
  },
  putObject: returnVoid,
  getAddressHash() {
    return new ArrayBuffer(0);
  },
  setAddressHash: returnVoid,
  unsetAddressHash: returnVoid,
};

function returnDelayed<T>(this: T) {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(this);
    }, 5000);
  });
}

export const fakeDelayedDriver: Required<ChannelDriver> = {
  deleteObject: returnDelayed,
  getObject: returnDelayed.bind(new ArrayBuffer(0)),
  putObject: returnDelayed,
  getAddressHash: returnDelayed.bind(new ArrayBuffer(0)),
  setAddressHash: returnDelayed,
  unsetAddressHash: returnDelayed,
};
