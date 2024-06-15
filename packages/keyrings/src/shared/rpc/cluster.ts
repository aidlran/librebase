import type { Dispatch } from './dispatch.js';
import type { MessageConfig, OperationsOf } from './types.js';

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

export function createCluster<Config extends MessageConfig>(
  constructor: () => Dispatch<Config>,
  options?: ClusterOptions,
) {
  const length = options?.clusterSize ?? calculateClusterSize();
  const dispatches = Array.from({ length }, constructor);
  const getNext = (options?.loadBalancer ?? RoundRobin)(dispatches);
  return {
    postToAll: <T extends OperationsOf<Config>>(
      operation: T,
      request: Config[T][0],
      instanceID?: string,
    ) => Promise.all(dispatches.map((dispatch) => dispatch(operation, request, instanceID))),
    postToOne: <T extends OperationsOf<Config>>(
      operation: T,
      request: Config[T][0],
      instanceID?: string,
    ) => getNext()(operation, request, instanceID),
  };
}
