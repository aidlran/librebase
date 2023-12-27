import { beforeEach, describe, expect, it, test } from 'vitest';
import { Observable } from '../../observable/observable.js';
import type { PostToAllAction } from '../../worker/types/action.js';
import type { Request } from '../../worker/types/request.js';
import type { Result } from '../../worker/types/result.js';
import type { WorkerPostMultiResultCallback } from '../../worker/worker-dispatch.js';
import type { ActiveSessionObservable, AllSessionsObservable } from '../types.js';
import { construct } from './load.js';

const postToAll = <T extends PostToAllAction>(
  request: Request<T>,
  callback?: WorkerPostMultiResultCallback<T>,
) => {
  if (request.action !== 'session.load') {
    throw new Error('Unexpected request action');
  }
  if (callback) {
    const result: Result<'session.load'> = {
      action: 'session.load',
      ok: true,
      payload: { id: (request as Request<'session.load'>).payload.id },
    };
    callback([result as Result<T>]);
  }
};
const allSessions: AllSessionsObservable = new Observable({});
const activeSession = new Observable(undefined) as ActiveSessionObservable;
const fn = construct({ postToAll }, activeSession, allSessions);

it("doesn't use an unexpected request action", () => {
  expect(() => fn(1, 'passphrase')).not.toThrow();
});

describe('sets the active session', () => {
  const checkResult = () => {
    expect(allSessions.get()[1]).property('active').equals(true);
    expect(activeSession.get()).property('id').equals(1);
  };

  beforeEach(() => {
    allSessions.update(() => ({}));
    activeSession.update(() => undefined);
  });

  test('callback', () => {
    fn(1, 'passphrase', checkResult);
  });

  test('asPromise', () => {
    expect(fn.asPromise(1, 'passphrase')).resolves;
    checkResult();
  });
});
