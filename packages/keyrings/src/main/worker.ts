import { deleteOne, getOne, putOne } from '@librebase/core';
import type { DispatchMessage } from '../shared/dispatch';
import type { WorkerMessage } from '../shared/worker-message';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleWorkerMessage(
  this: { postMessage(message: unknown): unknown },
  { data: { jobID, payload } }: MessageEvent<DispatchMessage<WorkerMessage>>,
) {
  let op: Promise<unknown>;
  switch (payload.op) {
    case 'del':
      op = deleteOne(payload.id, payload.instanceID);
      break;
    case 'get':
      op = getOne(payload.id, payload.instanceID);
      break;
    case 'put':
      op = putOne(payload.id, payload.val, payload.instanceID);
      break;
  }
  void op.then((payload) => this.postMessage({ jobID, payload } as DispatchMessage));
}
