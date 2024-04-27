import '@vitest/web-worker';
import { describe, expect, it } from 'vitest';
import { createWorker } from './create-worker';

describe('ReadyWorker', () => {
  it.todo('queues messages until ready is observed');
});

describe('createWorker', () => {
  it('constructs', () => expect(createWorker()).toBeInstanceOf(Worker));
});
