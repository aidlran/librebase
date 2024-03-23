import type { ChannelDriver } from '../src/channel/types';

function throwError() {
  throw new Error();
}

export const fakeErrorDriver: ChannelDriver = {
  deleteNode: throwError,
  getNode: throwError,
  putNode: throwError,
  getAddressedNodeHash: throwError,
  setAddressedNodeHash: throwError,
  unsetAddressedNode: throwError,
};

function returnVoid() {}
export const fakeVoidDriver: ChannelDriver = {
  deleteNode: returnVoid,
  getNode: returnVoid,
  putNode: returnVoid,
  getAddressedNodeHash: returnVoid,
  setAddressedNodeHash: returnVoid,
  unsetAddressedNode: returnVoid,
};

export const fakeValidDriver: ChannelDriver = {
  deleteNode: returnVoid,
  getNode() {
    return ['', new Uint8Array()];
  },
  putNode: returnVoid,
  getAddressedNodeHash() {
    return new Uint8Array();
  },
  setAddressedNodeHash: returnVoid,
  unsetAddressedNode: returnVoid,
};

function returnDelayed<T>(this: T) {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(this);
    }, 5000);
  });
}

export const fakeDelayedDriver: ChannelDriver = {
  deleteNode: returnDelayed,
  getNode: returnDelayed.bind(['', new Uint8Array()]),
  putNode: returnDelayed,
  getAddressedNodeHash: returnDelayed.bind(new Uint8Array()),
  setAddressedNodeHash: returnDelayed,
  unsetAddressedNode: returnDelayed,
};
