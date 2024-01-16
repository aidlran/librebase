import { createMicrotaskQueue } from '../microtask-queue/function/create-microtask-queue';
import { constructCreateSignal } from './function/create-signal';

export * from './types';
export * from './function/to-read-only-signal';

const addToNotifyQueue = createMicrotaskQueue();

export const createSignal = constructCreateSignal(addToNotifyQueue);
