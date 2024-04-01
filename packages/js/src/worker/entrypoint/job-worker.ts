import { sign, verify } from '@noble/secp256k1';
import { type BIP32Interface } from 'bip32';
import { Buffer } from 'buffer';
import { shred } from '../../buffer';
import { HashAlgorithm, hash } from '../../hash';
import { openKeyringDB } from '../../keyring/init-db';
import { WrapType, type ECDSAWrapValue, type EncryptWrapValue } from '../../wrap';
import { createDispatch, type JobResultWorkerMessage } from '../dispatch/create-dispatch';
import type { Job, UnwrapResult, WorkerDataRequest, WorkerMessage, WrapResult } from '../types';
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
        case 'unwrap': {
          switch (job.payload.type) {
            case WrapType.ECDSA: {
              if (
                !verify(
                  job.payload.metadata.signature,
                  (await hash(job.payload.hash[0], job.payload.payload)).value,
                  job.payload.metadata.publicKey,
                )
              ) {
                throw new Error('Invalid signature');
              }
              resultPayload = {
                config: {
                  hashAlg: job.payload.hash[0],
                  metadata: job.payload.metadata.publicKey,
                  type: job.payload.type,
                },
                payload: job.payload.payload,
              } as UnwrapResult;
              break;
            }

            case WrapType.Encrypt: {
              const identityID =
                publicKeys![JSON.stringify(Array.from(job.payload.metadata.pubKey))];
              if (!identityID) throw new TypeError('No private key available');
              const identity = await getIdentity(dispatch, identityID, keyring);
              if (!identity.privateKey) throw new TypeError('No private key available');

              const sourceKey = await crypto.subtle.importKey(
                'raw',
                identity.privateKey,
                job.payload.metadata.kdf,
                false,
                ['deriveKey'],
              );

              const derivedKey = await crypto.subtle.deriveKey(
                {
                  name: job.payload.metadata.kdf,
                  hash: job.payload.metadata.hashAlg,
                  salt: job.payload.metadata.salt,
                  iterations: job.payload.metadata.iterations,
                },
                sourceKey,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt'],
              );

              const payload = new Uint8Array(
                await crypto.subtle.decrypt(
                  {
                    name: 'AES-GCM',
                    iv: job.payload.metadata.iv,
                  },
                  derivedKey,
                  job.payload.payload,
                ),
              );

              const givenHash = job.payload.hash.subarray(1);
              const checkHash = (await hash(job.payload.hash[0], payload)).value;
              if (givenHash.length != checkHash.length) throw new Error('Hash is not valid');
              for (const i in givenHash)
                if (givenHash[i] != checkHash[i]) throw new Error('Hash is not valid');

              resultPayload = {
                config: {
                  hashAlg: job.payload.hash[0],
                  metadata: job.payload.metadata,
                  type: job.payload.type,
                },
                payload,
              } as UnwrapResult;

              break;
            }

            default:
              throw new Error('Unsupported wrap type');
          }
          break;
        }
        case 'wrap': {
          const hashAlg = job.payload.hashAlg ?? HashAlgorithm.SHA256;
          const payloadHash = await hash(hashAlg, job.payload.payload);
          switch (job.payload.type) {
            case WrapType.ECDSA: {
              const identityID = publicKeys![JSON.stringify(Array.from(job.payload.metadata))];
              if (!identityID) throw new TypeError('No private key available');
              const identity = await getIdentity(dispatch, identityID, keyring);
              if (!identity.privateKey) throw new TypeError('No private key available');
              resultPayload = {
                hash: payloadHash.toBytes(),
                metadata: {
                  publicKey: job.payload.metadata,
                  signature: await sign(payloadHash.value, identity.privateKey),
                },
                payload: job.payload.payload,
                type: job.payload.type,
              } as WrapResult & ECDSAWrapValue;
              break;
            }

            case WrapType.Encrypt: {
              const identityID =
                publicKeys![JSON.stringify(Array.from(job.payload.metadata.pubKey))];
              if (!identityID) throw new TypeError('No private key available');
              const identity = await getIdentity(dispatch, identityID, keyring);
              if (!identity.privateKey) throw new TypeError('No private key available');

              const encryptionHashAlg = job.payload.metadata.hashAlg ?? 'SHA-256';
              const iterations = job.payload.metadata.iterations ?? 600000;
              const iv = job.payload.metadata.iv ?? crypto.getRandomValues(new Uint8Array(12));
              const kdf = job.payload.metadata.kdf ?? 'PBKDF2';
              const salt = job.payload.metadata.salt ?? crypto.getRandomValues(new Uint8Array(16));

              const sourceKey = await crypto.subtle.importKey(
                'raw',
                identity.privateKey,
                kdf,
                false,
                ['deriveKey'],
              );

              const derivedKey = await crypto.subtle.deriveKey(
                {
                  name: kdf,
                  hash: encryptionHashAlg,
                  salt,
                  iterations,
                },
                sourceKey,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt'],
              );

              const payload = new Uint8Array(
                await crypto.subtle.encrypt(
                  {
                    name: 'AES-GCM',
                    iv,
                  },
                  derivedKey,
                  job.payload.payload,
                ),
              );

              resultPayload = {
                hash: payloadHash.toBytes(),
                metadata: {
                  hashAlg: encryptionHashAlg,
                  iterations,
                  iv,
                  kdf,
                  pubKey: job.payload.metadata.pubKey,
                  salt,
                },
                payload,
                type: WrapType.Encrypt,
              } as WrapResult & EncryptWrapValue;

              break;
            }

            default:
              throw new Error('Unsupported wrap type');
          }
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
