import { createSignal } from '@adamant/signals';
import { beforeEach, describe, expect, it, test } from 'vitest';
import type { PostToAllAction } from '../../worker/types/action.js';
import type { Request } from '../../worker/types/request.js';
import type { WorkerPostMultiResultCallback } from '../../worker/worker-dispatch.js';
import type { ActiveSession, AllSessions } from '../types.js';
import { construct } from './clear.js';

const postToAll = <T extends PostToAllAction>(
  request: Request<T>,
  callback?: WorkerPostMultiResultCallback<T>,
) => {
  if (request.action !== 'session.clear') {
    throw new Error('Unexpected request action');
  }
  if (callback) {
    callback([]);
  }
};
const activeSession = createSignal<ActiveSession | undefined>(undefined);
const allSessions = createSignal<AllSessions>({});
const fn = construct({ postToAll }, activeSession, allSessions);

describe('clear session', () => {
  it("doesn't use an unexpected request action", () => {
    expect(fn).not.toThrow();
  });

  describe('clears the active session', () => {
    const checkResult = () => {
      expect(allSessions()[1]).property('active').equals(false);
      expect(activeSession()).toBeUndefined();
    };

    beforeEach(() => {
      const session: ActiveSession = { id: 1, active: true };
      allSessions.set({ 1: session });
      activeSession.set(session);
    });

    test('callback', () => {
      fn(checkResult);
    });

    test('asPromise', () => {
      expect(fn.asPromise()).resolves;
      checkResult();
    });
  });
});
