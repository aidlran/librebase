import type { KdfType } from '../../kdf/types';

export enum WorkerMessageType {
  /** A message from the worker indicating that it is initialised and ready to receive messages. */
  READY,
  /** A message from the worker with the result of a dispatched job. */
  RESULT,
  /** A message from the worker requesting additional data. */
  DATA,
}

export interface WorkerMessage<T extends WorkerMessageType = WorkerMessageType> {
  type: T;
}

export enum WorkerDataRequestType {
  GET_ROOT_NODE,
  SET_ROOT_NODE,
}

export type GetRootNodeRequest = [
  WorkerMessageType.DATA,
  WorkerDataRequestType.GET_ROOT_NODE,
  KdfType,
  publicKey: Uint8Array,
  instanceID?: string,
];

export type SetRootNodeRequest = [
  WorkerMessageType.DATA,
  WorkerDataRequestType.SET_ROOT_NODE,
  KdfType,
  publicKey: Uint8Array,
  mediaType: string,
  payload: unknown,
  instanceID?: string,
];

export type WorkerDataRequest = GetRootNodeRequest | SetRootNodeRequest;
