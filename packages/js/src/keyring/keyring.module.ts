import { createDerived, createSignal } from '@adamantjs/signals';
import { getChannels } from '../channel/channel.module';
import { getDataModule } from '../data/data.module';
import { getAll, type Session } from '../indexeddb/indexeddb';
import { createModule } from '../module/create-module';
import type {
  CreateKeyringRequest,
  CreateKeyringResult,
  ImportKeyringRequest,
} from '../worker/types';
import { getJobWorker } from '../worker/worker.module';
import { getIdentity, type Identity } from './identity';

export interface Keyring<T = unknown> {
  id: number;
  metadata?: T;
}

export interface ActiveKeyring<T = unknown> extends Keyring<T> {
  getIdentity(id: string): Identity;
}

export const getKeyringModule = createModule((key) => {
  const channels = getChannels(key);
  const dataModule = getDataModule(key);
  const { postToAll, postToOne } = getJobWorker(key);

  const [active, setActive] = createSignal<ActiveKeyring | undefined>(undefined);
  const exposedActive = createDerived(() => (active() ? { ...active() } : undefined));

  return {
    active: exposedActive as <T>() => ActiveKeyring<T> | undefined,

    activate<T>(id: number, passphrase: string) {
      return new Promise<ActiveKeyring<T>>((resolve) => {
        postToAll({ action: 'keyring.load', payload: { id, passphrase } }, ([{ payload }]) => {
          const keyring = payload as ActiveKeyring<T>;
          keyring.getIdentity = getIdentity.bind([postToOne, channels, dataModule]);
          setActive(keyring);
          resolve(keyring);
        });
      });
    },
    clearActive() {
      setActive(undefined);
    },
    create<T>(options: CreateKeyringRequest<T>) {
      return new Promise<CreateKeyringResult>((resolve) => {
        postToOne({ action: 'keyring.create', payload: options }, ({ payload }) => {
          resolve(payload);
        });
      });
    },
    async getAll<T = unknown>(): Promise<Keyring<T>[]> {
      const keyrings = (await getAll('session')) as Session<T>[];
      return keyrings.map((keyring) => ({
        id: keyring.id as number,
        metadata: keyring.metadata,
      }));
    },
    import<T>(options: ImportKeyringRequest<T>) {
      return new Promise<number>((resolve) => {
        postToOne({ action: 'keyring.import', payload: options }, ({ payload }) => {
          resolve(payload.id);
        });
      });
    },
  };
});
