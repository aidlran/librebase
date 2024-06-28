import { deleteOne, getOne, putOne } from '../../public/repository.js';
import { Handlers } from '../server/server.js';
import { listen, type ResponderTarget } from '../server/worker.js';
import { createCluster } from './cluster.js';
import { createDeferredDispatch, type DeferredDispatchTarget } from './dispatch.js';

/**
 * A worker-like interface.
 *
 * ## Supported
 *
 * - A Web Worker API `Worker` instance.
 * - A Node.js `worker_threads.Worker` instance.
 *
 * @category Worker
 * @experimental
 */
export type WorkerLike = DeferredDispatchTarget & ResponderTarget;

/**
 * Constructs an {@linkcode RPCClient} using a worker strategy. Supports either Web Worker or Node.js
 * `worker_threads`.
 *
 * @category Strategy
 * @param constructor A constructor function that returns a {@linkcode WorkerLike}.
 * @returns An object that implements the {@linkcode RPCClient} interface.
 * @experimental
 */
export function workerStrategy(constructor: () => WorkerLike) {
  const target = constructor();
  Handlers.set('delete', deleteOne);
  Handlers.set('get', getOne);
  Handlers.set('put', (request: { id: ArrayBuffer; content: ArrayBuffer }, instanceID) =>
    putOne(request.id, request.content, instanceID),
  );
  listen(target);
  return createCluster(() => createDeferredDispatch(target));
}
