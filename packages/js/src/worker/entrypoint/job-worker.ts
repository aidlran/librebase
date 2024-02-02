import type { BIP32Interface } from 'bip32';
import { Buffer } from 'buffer';
import { WorkerMessageType, type WorkerMessage } from '../types/message';
import type { Action, Job } from '../types/index';
import { createSession } from './jobs/session/create';
import { importSession } from './jobs/session/import';
import { load } from './jobs/session/load';
import { save } from './jobs/session/save';
import type { JobResultWorkerMessage } from '../dispatch/create-dispatch';

// Polyfill Buffer for bip32 package
globalThis.Buffer = Buffer;

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- re-enable once using this
let session: BIP32Interface | undefined;

self.onmessage = async (event: MessageEvent<Job<Action> | undefined>) => {
  try {
    if (!event.data?.action) {
      throw TypeError('No action provided');
    }

    let resultPayload: unknown;

    switch (event.data.action) {
      case 'session.clear': {
        session = undefined;
        break;
      }
      case 'session.create': {
        resultPayload = await createSession(save, event.data.payload);
        break;
      }
      case 'session.import': {
        resultPayload = await importSession(save, event.data.payload);
        break;
      }
      case 'session.load': {
        const { node, result } = await load(event.data.payload);
        session = node;
        resultPayload = result;
        break;
      }
      default: {
        throw TypeError('Action not supported');
      }
    }
    const errorMessage: JobResultWorkerMessage = {
      type: WorkerMessageType.RESULT,
      action: event.data.action,
      jobID: event.data.jobID,
      ok: true,
      payload: resultPayload as never,
    };
    self.postMessage(errorMessage);
  } catch (error) {
    const errorMessage: JobResultWorkerMessage = {
      type: WorkerMessageType.RESULT,
      action: event.data?.action as never,
      jobID: event.data?.jobID as never,
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    self.postMessage(errorMessage);
    throw error;
  }
};

const readyMessage: WorkerMessage<WorkerMessageType.READY> = { type: WorkerMessageType.READY };
self.postMessage(readyMessage);
