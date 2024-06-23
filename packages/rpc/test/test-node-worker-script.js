import { parentPort } from 'worker_threads';
import { setupTestWorkerScript } from './worker-setup.js';

if (parentPort) {
  setupTestWorkerScript(parentPort);
}
