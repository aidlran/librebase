import type { KdfType } from '../../kdf/types';

/** @deprecated */
export enum WorkerMessageType {
  /** A message from the worker indicating that it is initialised and ready to receive messages. */
  READY,
  /** A message from the worker with the result of a dispatched job. */
  RESULT,
  /** A message from the worker requesting additional data. */
  DATA,
}

/** @deprecated */
export interface WorkerMessage<T extends WorkerMessageType = WorkerMessageType> {
  type: T;
}

/** @deprecated */
export enum WorkerDataRequestType {
  GET_ROOT_NODE,
  SET_ROOT_NODE,
}

/** @deprecated */
export type GetRootNodeRequest = [
  WorkerMessageType.DATA,
  WorkerDataRequestType.GET_ROOT_NODE,
  KdfType,
  publicKey: Uint8Array,
  instanceID?: string,
];

/** @deprecated */
export type SetRootNodeRequest = [
  WorkerMessageType.DATA,
  WorkerDataRequestType.SET_ROOT_NODE,
  KdfType,
  publicKey: Uint8Array,
  mediaType: string,
  payload: unknown,
  instanceID?: string,
];

/** @deprecated */
export type WorkerDataRequest = GetRootNodeRequest | SetRootNodeRequest;
