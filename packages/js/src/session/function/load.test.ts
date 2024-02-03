import { createSignal } from '@adamantjs/signals';
import { beforeEach, describe, expect, it, test } from 'vitest';
import type { JobResultWorkerMessage } from '../../worker/dispatch/create-dispatch';
import { WorkerMessageType } from '../../worker/types/message';
import type { Request } from '../../worker/types/request';
import type { WorkerModule } from '../../worker/worker.module';
import type { AllSessions, ActiveSession } from '../types';
import { construct } from './load';

const postToAll: WorkerModule['postToAll'] = (request, callback?) => {
  if (request.action !== 'session.load') {
    throw new Error('Unexpected request action');
  }
  if (callback) {
    const result: JobResultWorkerMessage<'session.load'> = {
      type: WorkerMessageType.RESULT,
      jobID: 0,
      action: 'session.load',
      ok: true,
      payload: { id: (request as Request<'session.load'>).payload.id },
    };
    callback([result as never]);
  }
};
const activeSession = createSignal<ActiveSession | undefined>(undefined);
const [getActiveSession, setActiveSession] = activeSession;
const allSessions = createSignal<AllSessions>({});
const [getAllSessions, setAllSessions] = allSessions;
const fn = construct({ postToAll }, setActiveSession, allSessions);

describe('load session', () => {
  it("doesn't use an unexpected request action", () => {
    expect(() => fn(1, 'passphrase')).not.toThrow();
  });

  describe('sets the active session', () => {
    const checkResult = () => {
      expect(getAllSessions()[1]).property('active').equals(true);
      expect(getActiveSession()).property('id').equals(1);
    };

    beforeEach(() => {
      setAllSessions({});
      setActiveSession(undefined);
    });

    test('callback', () => {
      fn(1, 'passphrase', checkResult);
    });

    test('asPromise', () => {
      expect(fn.asPromise(1, 'passphrase')).resolves;
      checkResult();
    });
  });
});
