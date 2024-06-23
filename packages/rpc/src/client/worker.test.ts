import '@vitest/web-worker';
import { describe, expect, test } from 'vitest';
import { Worker as NodeWorker } from 'worker_threads';
import { workerStrategy } from './worker.js';

describe('RPC Worker Strategy', () => {
  const scriptPath = '../../test/dummy-script.js';

  test('Web Worker', () => {
    const constructor = () => new Worker(new URL(scriptPath, import.meta.url));
    expect(() => workerStrategy(constructor)).not.toThrow();
  });

  test.todo('Node.js worker_threads', () => {
    const constructor = () => new NodeWorker(scriptPath);
    expect(() => workerStrategy(constructor as never)).not.toThrow();
  });
});
