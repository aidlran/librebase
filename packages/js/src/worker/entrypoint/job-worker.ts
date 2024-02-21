import { type BIP32Interface } from 'bip32';
import { Buffer } from 'buffer';
import { KdfType } from '../../crypto/kdf/types';
import { createDispatch, type JobResultWorkerMessage } from '../dispatch/create-dispatch';
import type { GetNodeRequest, Job, WorkerMessage } from '../types';
import { WorkerDataRequestType, WorkerMessageType } from '../types';
import { createSession } from './jobs/session/create';
import { importSession } from './jobs/session/import';
import { load } from './jobs/session/load';
import { save } from './jobs/session/save';

// Polyfill Buffer for bip32 package
globalThis.Buffer = Buffer;

const dispatch = createDispatch(self, 1);

let keyring: BIP32Interface | undefined;

// eslint-disable-next-line @typescript-eslint/no-misused-promises
self.addEventListener('message', async (event: MessageEvent<[number, number, Job]>) => {
  try {
    const [dispatchID, jobID, job] = event.data;

    if (dispatchID == 0) {
      if (!job.action) {
        throw TypeError('No action provided');
      }

      let resultPayload: unknown;

      switch (job.action) {
        case 'identity.get': {
          resultPayload = '';
          const indexIdentity = keyring!.deriveHardened(0);
          const indexRequest: GetNodeRequest = [
            WorkerMessageType.DATA,
            WorkerDataRequestType.GET_ROOT_NODE,
            KdfType.secp256k1_hd,
            new Uint8Array(indexIdentity.publicKey),
          ];
          dispatch(indexRequest, (response) => {
            // eslint-disable-next-line no-console
            console.log('received a response!', response);
          });
          break;
        }
        case 'keyring.clear': {
          keyring = undefined;
          break;
        }
        case 'keyring.create': {
          resultPayload = await createSession(save, job.payload);
          break;
        }
        case 'keyring.import': {
          resultPayload = await importSession(save, job.payload);
          break;
        }
        case 'keyring.load': {
          const { node, result } = await load(job.payload);
          keyring = node;
          resultPayload = result;
          break;
        }
        default: {
          throw TypeError('Action not supported');
        }
      }
      const errorMessage: JobResultWorkerMessage = {
        type: WorkerMessageType.RESULT,
        action: job.action,
        jobID: jobID,
        ok: true,
        payload: resultPayload as never,
      };
      self.postMessage([dispatchID, jobID, errorMessage]);
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

const readyMessage: WorkerMessage<WorkerMessageType.READY> = { type: WorkerMessageType.READY };
self.postMessage(readyMessage);
