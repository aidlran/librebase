import { describe, expect, it } from 'vitest';
import type { JobResultWorkerMessage } from '../../../worker/dispatch/create-dispatch';
import { WorkerMessageType } from '../../../worker/types';
import type { WorkerModule } from '../../../worker/worker.module';
import { createKeyring } from './create';

/** Mocked worker `postToOne` function. */
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

/** Bind dependencies. */
const fn = createKeyring.bind([postToOne]);

describe('create session', () => {
  it("doesn't use an unexpected request action", () => {
    void expect(fn({ passphrase: 'passphrase' })).resolves.not.toThrow();
  });
});
