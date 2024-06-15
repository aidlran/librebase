import { deleteOne, getOne, putOne } from '@librebase/core';
import type {
  HostOriginMessageConfig,
  WorkerOriginMessageConfig,
} from '../../shared/message-configs.js';
import {
  createCluster,
  createDeferredDispatch,
  createResponder,
  type DeferredDispatchTarget,
  type ResponderCallbacks,
  type ResponderTarget,
} from '../../shared/rpc/index.js';

const responderConfig: ResponderCallbacks<WorkerOriginMessageConfig> = {
  delete: deleteOne as never,
  get: getOne as never,
  put: ((request: WorkerOriginMessageConfig['put'][0], instanceID?: string) =>
    putOne(request.id, request.content, instanceID)) as never,
};

export let cluster: ReturnType<typeof createCluster>;

export function initRPC(
  strategy: () => DeferredDispatchTarget<HostOriginMessageConfig> &
    ResponderTarget<WorkerOriginMessageConfig>,
) {
  const target = strategy();
  // TODO: register as a channel
  createResponder(target, responderConfig);
  cluster = createCluster(() => createDeferredDispatch<HostOriginMessageConfig>(target));
}
