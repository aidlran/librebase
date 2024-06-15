import '@vitest/web-worker';
import { expect, test } from 'vitest';
import { WebWorkerStrategy } from './web-worker.strategy.js';

test('Web Worker Strategy', () => {
  expect(WebWorkerStrategy()).toBeInstanceOf(Worker);
});
