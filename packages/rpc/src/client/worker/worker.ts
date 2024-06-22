/** @module Client / Worker */

import { deleteOne, getOne, putOne } from '@librebase/core';
import { Handlers } from '../../server/server.js';
import { listen, type ResponderTarget } from '../../server/worker/worker.js';
import { createCluster } from '../cluster.js';
import { createDeferredDispatch, type DeferredDispatchTarget } from '../dispatch.js';

export type WorkerLike = DeferredDispatchTarget & ResponderTarget;

export type WorkerConstructor = () => WorkerLike;

export function workerStrategy(constructor: WorkerConstructor) {
  const target = constructor();
  Handlers.set('delete', deleteOne);
  Handlers.set('get', getOne);
  Handlers.set('put', (request: { id: ArrayBuffer; content: ArrayBuffer }, instanceID) =>
    putOne(request.id, request.content, instanceID),
  );
  listen(target);
  return createCluster(() => createDeferredDispatch(target));
}
