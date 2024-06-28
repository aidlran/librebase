import '@vitest/web-worker';
import { describe, expect, test } from 'vitest';
import { Worker as NodeWorker } from 'worker_threads';
import { workerStrategy } from './worker.js';

describe.skip('Worker RPC client', () => {
  for (const [suiteName, constructor] of [
    [
      'Web worker support',
      () => new Worker(new URL('../../testing/test-web-worker-script.js', import.meta.url)),
    ],
    [
      'Supports Node.js worker_threads',
      () => new NodeWorker('../../testing/test-node-worker-script.js'),
    ],
  ] as const) {
    describe(suiteName, () => {
      const client = workerStrategy(constructor);

      test('Success response', () => {
        expect(client.postToAll('testsuccess', '12', '34')).resolves.toEqual(['success']);
        expect(client.postToOne('testsuccess', '12', '34')).resolves.toBe('success');
      });

      test('Error response', () => {
        expect(client.postToAll('testerror', '12', '34')).rejects.toThrow('Expected error');
        expect(client.postToOne('testerror', '12', '34')).rejects.toThrow('Expected error');
      });
    });
  }
});
