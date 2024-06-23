/**
 * Defines the interface for RPC client implementations.
 *
 * @category Client
 */
export interface RPCClient {
  /**
   * Posts a request that must be processed by all servers.
   *
   * ## Implementation
   *
   * When implementing a client, if you have only one server, you can simply proxy the request to
   * `postToOne` and return an array.
   *
   * ```js
   * const client = {
   *   async postToAll(op, req, instanceID) {
   *     return [await client.postToOne(op, req, instanceID)];
   *   },
   *   postToOne(op, req, instanceID) {
   *     // client logic
   *   },
   * };
   * ```
   *
   * @template Res The expected response type.
   * @template Req The request value type.
   * @param operation The operation (A.K.A. request type)
   * @param request The request value.
   * @param instanceID The Librebase instance ID.
   */
  postToAll<Res, Req = unknown>(
    operation: string,
    request: Req,
    instanceID?: string,
  ): Promise<Res[]>;
  /**
   * Posts a request that can be processed by a single server.
   *
   * @template Res The expected response type.
   * @template Req The request value type.
   * @param operation The operation (A.K.A. request type)
   * @param request The request value.
   * @param instanceID The Librebase instance ID.
   */
  postToOne<Res, Req = unknown>(operation: string, request: Req, instanceID?: string): Promise<Res>;
}

/**
 * The {@linkcode RPCClient} used to invoke procedures. Libraries using RPC whould wrap calls to
 * {@linkcode client.postToOne} and {@linkcode client.postToAll} to build their public APIs.
 *
 * @category Client
 */
export let client: RPCClient;

/**
 * Defines the {@linkcode RPCClient} to use for invoking procedures.
 *
 * ## Example
 *
 * The following snippet will define the {@linkcode RPCClient}, using the {@linkcode NoWorker} (same
 * thread) strategy to invoke procedures.
 *
 * ```js
 * import { NoWorker, setClient } from '@librebase/rpc/client';
 *
 * setClient(NoWorker);
 * ```
 *
 * @category Client
 * @param {RPCClient} rpcClient The {@linkcode RPCClient} to use.
 */
export function setClient(rpcClient: RPCClient) {
  client = rpcClient;
}
