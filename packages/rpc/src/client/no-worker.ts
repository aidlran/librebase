import { processRequest } from '../server/server.js';
import type { RPCClient } from './client.js';

/**
 * An {@linkcode RPCClient} implementation that simply executes procedures in the same thread. This
 * strategy is useful for debugging and testing, however it is recommended to use
 * {@linkcode workerStrategy} in production apps to increase performance and security.
 *
 * ## Usage
 *
 * ```js
 * import { NoWorker, setHost } from '@librebase/rpc/client';
 *
 * setHost(NoWorker);
 * ```
 *
 * With this strategy, the thread acts as both the client and server. You must register request
 * handlers in the same thread.
 *
 * @category Strategy
 */
export const NoWorker: RPCClient = {
  postToAll: async (op, req, instanceID) => [await NoWorker.postToOne(op, req, instanceID)],
  async postToOne<Req, Res>(op: string, payload: Req, instanceID?: string) {
    const response = await processRequest({ instanceID, jobID: 0, op, payload });
    if (response.ok) {
      return response.payload as Res;
    } else {
      throw new Error(response.error);
    }
  },
};
