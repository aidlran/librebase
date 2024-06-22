import type { RPCClient } from './client.js';
import type { Dispatch } from './dispatch.js';

export interface ClusterOptions {
  clusterSize?: number;
  loadBalancer?: LoadBalancer;
}

/**
 * Calculate optimal cluster size, scaling with the `navigator.hardwareConcurrency` value when
 * available.
 */
export const calculateClusterSize = (ceiling = 1, floor = 1, multiplier = 0.25) =>
  Math.min(Math.max(Math.floor(navigator.hardwareConcurrency ?? 1 * multiplier), floor), ceiling);

export type LoadBalancer = <T>(items: T[]) => () => T;

export const RoundRobin: LoadBalancer = (items) => {
  let currentIndex = 0;
  return () => items[++currentIndex == items.length ? (currentIndex = 0) : currentIndex];
};

export function createCluster(constructor: () => Dispatch, options?: ClusterOptions): RPCClient {
  const length = options?.clusterSize ?? calculateClusterSize();
  const dispatches = Array.from({ length }, constructor);
  const getNext = (options?.loadBalancer ?? RoundRobin)(dispatches);
  return {
    postToAll: <Res, Req = unknown>(operation: string, request: Req, instanceID?: string) =>
      Promise.all(dispatches.map((dispatch) => dispatch<Res, Req>(operation, request, instanceID))),
    postToOne: (operation, request, instanceID) => getNext()(operation, request, instanceID),
  };
}
