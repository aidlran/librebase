import { Base58 } from '@librebase/core';
import { hash } from '@librebase/fs';
import type { WrapValue, WrapValueMetadataMap } from '@librebase/wraps';
import type { ECDSAWrappedMetadata } from '@librebase/wraps/module';
import { verify } from '@noble/secp256k1';
import type { BIP32Interface } from 'bip32';
import { Buffer } from 'buffer';
import { openKeyringDB } from '../../keyring/init-db';
import { createDispatch, type JobResultWorkerMessage } from '../dispatch/create-dispatch';
import type { Job, UnwrapResult, WorkerDataRequest, WorkerMessage } from '../types';
import { WorkerMessageType } from '../types';
import { getIdentity } from './jobs/identity/get';
import { createKeyring } from './jobs/keyring/create';
import { importKeyring } from './jobs/keyring/import';
import { loadKeyring } from './jobs/keyring/load';
import { saveKeyring } from './jobs/keyring/save';
import { wrap } from './jobs/wrap/wrap';

// Polyfill Buffer for bip32 package
globalThis.Buffer = Buffer;

const dispatch = createDispatch<WorkerDataRequest, unknown>(self, 1);

let keyring: BIP32Interface | undefined;

/**
 * A map of text encoded public keys to their identity ID.
 *
 * @todo Encode as base58 instead
 */
let identityPubKeyMap: Record<string, string> | undefined;

export async function findPrivateKey(address: Uint8Array): Promise<Buffer> {
  if (!keyring) {
    throw new Error('No active keyring');
  }
  let privateKey: Buffer | undefined;
  const stringifiedPubKey = JSON.stringify(Array.from(address.subarray(1)));
  const indexKey = keyring.deriveHardened(0);
  if (stringifiedPubKey === JSON.stringify(Array.from(indexKey.publicKey))) {
    privateKey = indexKey.privateKey;
  } else {
    const identityID = identityPubKeyMap![stringifiedPubKey];
    if (!identityID) throw new TypeError('No private key available');
    privateKey = (await getIdentity(dispatch, identityID, keyring)).privateKey;
  }
  if (!privateKey) throw new TypeError('No private key available');
  return privateKey;
}

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
          identityPubKeyMap![JSON.stringify(Array.from(publicKey))] = job.payload;
          break;
        }
        case 'keyring.clear': {
          if (keyring?.privateKey) {
            for (const i in keyring.privateKey) {
              keyring.privateKey[i] = 0;
            }
          }
          keyring = identityPubKeyMap = undefined;
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
          identityPubKeyMap = {};
          resultPayload = result;
          break;
        }
        // TODO: move signature algorithms to crypto module
        case 'unwrap': {
          switch (job.payload.$) {
            case 'wrap:ecdsa': {
              const wrap = job.payload as WrapValue<'ecdsa', ECDSAWrappedMetadata>;
              const hashBin = Base58.decode(wrap.h);
              resultPayload = verify(
                wrap.m.sig,
                (await hash(hashBin[0], wrap.p)).value,
                wrap.m.pub,
              );
              break;
            }

            case 'wrap:encrypt': {
              const wrap = job.payload as WrapValue<'encrypt', WrapValueMetadataMap['encrypt']>;

              const privateKey = await findPrivateKey(wrap.m.pubKey);

              const sourceKey = await crypto.subtle.importKey(
                'raw',
                privateKey,
                wrap.m.kdf,
                false,
                ['deriveKey'],
              );

              const derivedKey = await crypto.subtle.deriveKey(
                {
                  name: wrap.m.kdf,
                  hash: wrap.m.hashAlg,
                  salt: wrap.m.salt,
                  iterations: wrap.m.iterations,
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
                    iv: wrap.m.iv,
                  },
                  derivedKey,
                  wrap.p,
                ),
              );

              const givenHashBin = Base58.decode(wrap.h);
              const givenHash = givenHashBin.subarray(1);
              const checkHash = (await hash(givenHashBin[0], payload)).value;
              if (givenHash.length != checkHash.length) throw new Error('Hash is not valid');
              for (const i in givenHash)
                if (givenHash[i] != checkHash[i]) throw new Error('Hash is not valid');

              resultPayload = {
                metadata: wrap.m,
                payload,
              } as UnwrapResult<'encrypt'>;

              break;
            }

            default:
              throw new Error('Unsupported wrap type');
          }
          break;
        }
        case 'wrap': {
          resultPayload = await wrap(job.payload);
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
