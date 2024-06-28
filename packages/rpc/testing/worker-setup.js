// @ts-nocheck

import { Handlers, listen } from '../dist/server/index.js';

export function setupTestWorkerScript(target) {
  Handlers.set('testsuccess', (request, instanceID) => {
    if (request !== '12' || instanceID !== '34') {
      throw new Error('Unexpected request or instanceID value');
    }
    return 'success';
  });

  Handlers.set('testerror', (request, instanceID) => {
    if (request !== '12' || instanceID !== '34') {
      throw new Error('Unexpected request or instanceID value');
    }
    throw new Error('Expected error');
  });

  listen(target);

  // eslint-disable-next-line
  target.postMessage('ready');
}
