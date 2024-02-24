import type { KdfType } from '../../crypto/kdf/types';

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
}

export type GetNodeRequest = [
  WorkerMessageType.DATA,
  WorkerDataRequestType.GET_ROOT_NODE,
  KdfType,
  publicKey: Uint8Array,
];

export type WorkerDataRequest = GetNodeRequest;

export type GetNodeResponse<T = unknown> = T;

export type WorkerDataResponse = GetNodeResponse;
