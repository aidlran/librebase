import { ACTIVE_KEYRING_CHANGE, emit } from '../events';
import { getAllRecords } from '../indexeddb/indexeddb';
import type { CreateKeyringRequest, ImportKeyringRequest } from '../worker/types/payloads';
import { getWorker } from '../worker/worker.module';
import { openKeyringDB } from './init-db';
import type { PersistedKeyring, Keyring } from './types';

const activeKeyrings: Record<string, Keyring> = {};

let dbOpen = false;

/**
 * Unlocks a keyring and makes it the active keyring.
 *
 * @template T The type of the returned keyring's metadata field.
 * @param {number} keyringID The ID of the target keyring.
 * @param {string} passphrase The passphrase required to decrypt the target keyring.
 * @param {string} [instanceID] A particular protocol instance ID can be used if using multiple
 *   protocol instances.
 * @returns {Promise<Keyring<T>>} A promise that resolves with the activated keyring.
 */
export async function activateKeyring<T>(
  keyringID: number,
  passphrase: string,
  instanceID?: string,
) {
  const [{ payload }] = await getWorker().postToAll('keyring.load', {
    action: 'keyring.load',
    payload: { id: keyringID, passphrase },
    instanceID,
  });
  activeKeyrings[instanceID ?? ''] = payload;
  emit(ACTIVE_KEYRING_CHANGE, payload, instanceID);
  return payload as Keyring<T>;
}

/**
 * Creates a new keyring. The keyring is automatically encrypted and persisted locally, but it is
 * not automatically activated.
 *
 * @param {CreateKeyringRequest} options The options, including the passphrase to use for encryption
 *   and any arbitrary metadata to store alongside the payload.
 * @param {string} [instanceID] A particular protocol instance ID can be used if using multiple
 *   protocol instances.
 * @returns {Promise<CreateKeyringResult>} A promise that resolves with the result, including the ID
 *   of the keyring and it's mnemonic recovery seed phrase.
 */
export async function createKeyring(options: CreateKeyringRequest, instanceID?: string) {
  return (
    await getWorker().postToOne('keyring.create', {
      action: 'keyring.create',
      payload: options,
      instanceID,
    })
  ).payload;
}

/**
 * Deactivates the current active keyring and shreds any keys in working memory. This is the
 * equivalent of a user log out function.
 *
 * Note that persistent storage is not affected. The keyring will remain there in its encrypted
 * form.
 *
 * @param {string} [instanceID] A particular protocol instance ID can be used if using multiple
 *   instances.
 */
export async function deactivateKeyring(instanceID?: string) {
  await getWorker().postToAll('keyring.clear', { action: 'keyring.clear', instanceID });
  delete activeKeyrings[instanceID ?? ''];
  emit(ACTIVE_KEYRING_CHANGE, null, instanceID);
}

/**
 * @template T The type of the returned keyring's metadata field.
 * @param {string} [instanceID] A particular protocol instance ID can be used if using multiple
 *   instances.
 * @returns {Keyring<T> | undefined} The active keyring, or `undefined` if no keyring is active.
 */
export function getActiveKeyring<T>(instanceID?: string) {
  return activeKeyrings[instanceID ?? ''] as Keyring<T> | undefined;
}

/**
 * Retrieves all available keyrings.
 *
 * @template T The type of all of the returned `Keyring` metadata fields.
 * @returns A promise that resolves with an array of `Keyring` objects.
 */
export async function getAllKeyrings<T>(): Promise<Keyring<T>[]> {
  if (!dbOpen) {
    await openKeyringDB();
    dbOpen = true;
  }
  const keyrings = await getAllRecords<PersistedKeyring<T>>('lbkeyrings', 'keyring');
  return keyrings.map((keyring) => ({ id: keyring.id, metadata: keyring.metadata }));
}

/**
 * Import a keyring using a mnemonic recovery seed phrase. The keyring is automatically encrypted
 * and persisted locally, but it is not automatically activated.
 *
 * @param {ImportKeyringRequest} options The options, including the mnemonic, passphrase to use for
 *   encryption and any arbitrary metadata to store alongside the payload.
 * @param {string} [instanceID] A particular protocol instance ID can be used if using multiple
 *   protocol instances.
 * @returns {Promise<number>} A promise that resolves with the ID given to the imported keyring.
 */
export async function importKeyring(options: ImportKeyringRequest, instanceID?: string) {
  return (
    await getWorker().postToOne('keyring.import', {
      action: 'keyring.import',
      payload: options,
      instanceID,
    })
  ).payload.id;
}
