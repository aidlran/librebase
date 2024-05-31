import { unwrap, wrap } from '@librebase/wraps';
import { Buffer } from 'buffer';
import { getIdentity } from '../../3-service/identity';
import { clearKeyring, createKeyring, importKeyring, loadKeyring } from '../../3-service/keyring';
import { openKeyringDB } from '../../keyring/init-db';
import type { JobResultWorkerMessage } from '../dispatch/create-dispatch';
import { WorkerMessageType, type WorkerMessage } from '../types/message';
import type { Job } from '../types/request';

// Polyfill Buffer for bip32 package
globalThis.Buffer = Buffer;

// eslint-disable-next-line @typescript-eslint/no-misused-promises
self.addEventListener('message', async (event: MessageEvent<[number, number, Job]>) => {
  try {
    const [dispatchID, jobID, job] = event.data;

    if (dispatchID == 0) {
      if (!job.action) {
        throw TypeError('No action provided');
      }

      let resultPayload: unknown;

      // TODO: enable instanceID
      switch (job.action) {
        case 'identity.get': {
          resultPayload = (await getIdentity(job.payload, job.instanceID)).publicKey;
          break;
        }
        case 'keyring.clear': {
          clearKeyring(job.instanceID);
          break;
        }
        case 'keyring.create': {
          resultPayload = await createKeyring(job.payload, job.instanceID);
          break;
        }
        case 'keyring.import': {
          resultPayload = await importKeyring(job.payload, job.instanceID);
          break;
        }
        case 'keyring.load': {
          resultPayload = await loadKeyring(job.payload, job.instanceID);
          break;
        }
        case 'unwrap': {
          resultPayload = await unwrap(job.payload, job.instanceID);
          break;
        }
        case 'wrap': {
          resultPayload = await wrap(job.payload, job.instanceID);
          break;
        }
        default: {
          throw TypeError('Action not supported');
        }
      }
      // TODO(lint): odd typescript error after introducing `identity.verify`
      const message /* : JobResultWorkerMessage */ = {
        type: WorkerMessageType.RESULT,
        action: job.action,
        jobID: jobID,
        ok: true,
        payload: resultPayload,
      };
      self.postMessage([dispatchID, jobID, message]);
    }
  } catch (error) {
    const errorMessage: JobResultWorkerMessage = {
      type: WorkerMessageType.RESULT,
      action: event.data?.[2]?.action as never,
      jobID: event.data?.[1],
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    self.postMessage([event.data?.[0], event.data?.[1], errorMessage]);
    throw error;
  }
});

void openKeyringDB().then(() => {
  const readyMessage: WorkerMessage<WorkerMessageType.READY> = { type: WorkerMessageType.READY };
  self.postMessage(readyMessage);
});
