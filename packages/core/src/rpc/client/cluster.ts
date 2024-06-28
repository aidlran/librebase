import type { RPCClient } from './client.js';
import type { Dispatch } from './dispatch.js';
import { roundRobin, type LoadBalancer } from './load-balancer.js';

/**
 * A function to dispatch a request to ALL servers.
 *
 * @category Cluster
 * @template Res The expected response type.
 * @template Req The request body type.
 * @param operation The request operation type.
 * @param request The request body.
 * @param instanceID The Librebase instance ID.
 */
export type ClusterDispatch = <Res, Req = unknown>(
  operation: string,
  request: Req,
  instanceID?: string,
) => Promise<Res[]>;

/**
 * Cluster construction options.
 *
 * @category Cluster
 */
export interface ClusterOptions {
  /**
   * The size of the cluster. If not specified, {@linkcode calculateClusterSize} will be used to get
   * a sensible default.
   */
  clusterSize?: number;
  /** The load balancer to use. If not specified, {@linkcode roundRobin} will be used. */
  loadBalancer?: LoadBalancer;
}

/**
 * Calculate optimal cluster size, scaling with the `navigator.hardwareConcurrency` value when
 * available.
 *
 * @category Cluster
 * @param ceiling The absolute maximum value to use. Default: 1
 * @param floor The absolute minimum to use. Default: 1
 * @param multiplier The scaling factor when `navigator.hardwareConcurrency` is available. Default:
 *   0.25 (i.e. with 8 threads, the value will be 2.)
 * @returns A calculated cluster size integer.
 */
export const calculateClusterSize = (ceiling = 1, floor = 1, multiplier = 0.25) =>
  Math.min(Math.max(Math.floor(navigator.hardwareConcurrency ?? 1 * multiplier), floor), ceiling);

/**
 * Constructs a cluster of dispatches.
 *
 * @category Cluster
 * @param constructor A constructor that returns a {@linkcode Dispatch}.
 * @param options An optional options object.
 * @returns A cluster object that implements the {@linkcode RPCClient} interface.
 */
export function createCluster(constructor: () => Dispatch, options?: ClusterOptions): RPCClient {
  const length = options?.clusterSize ?? calculateClusterSize();
  const dispatches = Array.from({ length }, constructor);
  const getNext = (options?.loadBalancer ?? roundRobin)(dispatches);
  return {
    postToAll: <Res, Req = unknown>(operation: string, request: Req, instanceID?: string) =>
      Promise.all(dispatches.map((dispatch) => dispatch<Res, Req>(operation, request, instanceID))),
    postToOne: (operation, request, instanceID) => getNext()(operation, request, instanceID),
  };
}
