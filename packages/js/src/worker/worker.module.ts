import { createModule } from '../module/create-module.js';
import { calculateClusterSize } from './cluster/calculate-cluster-size.js';
import { createCluster } from './cluster/create-cluster.js';
import { createWorker } from './constructor/create-worker.js';
import { createDispatch } from './dispatch/create-dispatch.js';
import { roundRobin } from './load-balancer/round-robin.js';

export const getWorkerModule = createModule(() => {
  const length = calculateClusterSize();
  const workers = Array.from({ length }, createWorker);
  const dispatches = workers.map(createDispatch);
  return createCluster(dispatches, roundRobin);
});
