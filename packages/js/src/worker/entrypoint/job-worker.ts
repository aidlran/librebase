import { sign, verify } from '@noble/secp256k1';
import { type BIP32Interface } from 'bip32';
import { Buffer } from 'buffer';
import { shred } from '../../crypto';
import { openKeyringDB } from '../../keyring/init-db';
import { createDispatch, type JobResultWorkerMessage } from '../dispatch/create-dispatch';
import type { Job, WorkerDataRequest, WorkerMessage } from '../types';
import { WorkerMessageType } from '../types';
import { getIdentity } from './jobs/identity/get';
import { createKeyring } from './jobs/keyring/create';
import { importKeyring } from './jobs/keyring/import';
import { loadKeyring } from './jobs/keyring/load';
import { saveKeyring } from './jobs/keyring/save';

// Polyfill Buffer for bip32 package
globalThis.Buffer = Buffer;

const dispatch = createDispatch<WorkerDataRequest, unknown>(self, 1);

let keyring: BIP32Interface | undefined;

/** A map of text encoded public keys to their identity ID. */
let publicKeys: Record<string, string> | undefined;

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
          const publicKey = (await getIdentity(dispatch, job.payload, keyring)).publicKey;
          resultPayload = publicKey;
          publicKeys![JSON.stringify(Array.from(publicKey))] = job.payload;
          break;
        }
        case 'keyring.clear': {
          if (keyring?.privateKey) shred(keyring.privateKey);
          keyring = publicKeys = undefined;
          break;
        }
        case 'keyring.create': {
          resultPayload = await createKeyring(saveKeyring, job.payload);
          break;
        }
        case 'keyring.import': {
          resultPayload = await importKeyring(saveKeyring, job.payload);
          break;
        }
        case 'keyring.load': {
          const { node, result } = await loadKeyring(job.payload);
          keyring = node;
          publicKeys = {};
          resultPayload = result;
          break;
        }
        // TODO: move signature algorithms to crypto module
        case 'sign': {
          const identityID = publicKeys![JSON.stringify(Array.from(job.payload.publicKey))];
          if (!identityID) throw new TypeError('No private key available');
          const identity = await getIdentity(dispatch, identityID, keyring);
          if (!identity.privateKey) throw new TypeError('No private key available');
          resultPayload = await sign(job.payload.hash, identity.privateKey);
          break;
        }
        case 'verify': {
          resultPayload = verify(job.payload.signature, job.payload.hash, job.payload.publicKey);
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
