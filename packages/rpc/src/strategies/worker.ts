import { deleteOne, getOne, putOne } from '@librebase/core';
import { createCluster } from '../cluster.js';
import { createDeferredDispatch, type DeferredDispatchTarget } from '../dispatch.js';
import { createResponder, type ResponderCallbacks, type ResponderTarget } from '../responder.js';
import type { MessageConfig } from '../types.js';

export type WorkerLike = DeferredDispatchTarget & ResponderTarget;

export type WorkerConstructor = () => WorkerLike;

export interface WorkerOriginMessageConfig extends MessageConfig {
  delete: [ArrayBuffer, void];
  get: [ArrayBuffer, ArrayBuffer];
  put: [{ id: ArrayBuffer; content: ArrayBuffer }, void];
}

const responderConfig: ResponderCallbacks<WorkerOriginMessageConfig> = {
  delete: deleteOne as never,
  get: getOne as never,
  put: ((request: WorkerOriginMessageConfig['put'][0], instanceID?: string) =>
    putOne(request.id, request.content, instanceID)) as never,
};

export function workerStrategy(constructor: WorkerConstructor) {
  const target = constructor();
  // TODO: register as a channel
  createResponder<WorkerOriginMessageConfig>(target, responderConfig);
  return createCluster(() => createDeferredDispatch(target));
}
