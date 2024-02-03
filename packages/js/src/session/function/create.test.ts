import { createSignal } from '@adamantjs/signals';
import { beforeEach, describe, expect, it, test } from 'vitest';
import type { JobResultWorkerMessage } from '../../worker/dispatch/create-dispatch';
import { WorkerMessageType } from '../../worker/types/message';
import type { WorkerModule } from '../../worker/worker.module';
import type { AllSessions } from '../types';
import { construct } from './create';
import type { SessionLoadFn } from './load';

const postToOne: WorkerModule['postToOne'] = (request, callback?) => {
  if (request.action !== 'session.create') {
    throw new Error('Unexpected request action');
  }
  if (callback) {
    const result: JobResultWorkerMessage<'session.create'> = {
      type: WorkerMessageType.RESULT,
      jobID: 0,
      action: 'session.create',
      ok: true,
      payload: { id: 1, mnemonic: 'mnemonic sentence' },
    };
    callback(result as never);
  }
};
const load: SessionLoadFn = (id, _passphrase, callback) => {
  if (callback) callback({ id });
};
load.asPromise = (id, passphrase) => {
  return new Promise((resolve) => load(id, passphrase, resolve));
};
const allSessions = createSignal<AllSessions>({});
const [getAllSessions, setAllSessions] = allSessions;
const fn = construct({ postToOne }, load, allSessions);

describe('create session', () => {
  it("doesn't use an unexpected request action", () => {
    expect(() => fn({ passphrase: 'passphrase' })).not.toThrow();
  });

  describe('add created session to all sessions observable', () => {
    const checkResult = () => {
      expect(getAllSessions()[1]).property('active').equals(false);
    };

    beforeEach(() => {
      setAllSessions({});
    });

    test('callback', () => {
      fn({ passphrase: 'passphrase' }, checkResult);
    });

    test('asPromise', () => {
      expect(fn.asPromise({ passphrase: 'passphrase' })).resolves;
      checkResult();
    });
  });
});
