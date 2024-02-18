import { createDerived, createSignal } from '@adamantjs/signals';
// import { getChannels } from '../channel/channel.module';
// import { getDataModule } from '../data/data.module';
import { getAll } from '../indexeddb/indexeddb';
import { createModule } from '../module/create-module';
import type { CreateSessionRequest, CreateSessionResult } from '../worker/types';
import { createJobWorker } from '../worker/worker.module';
import type { Keyring } from './types';

async function getAllKeyrings<T>(): Promise<Keyring<T>[]> {
  const keyrings = await getAll('session');
  return keyrings.map((keyring) => ({
    id: keyring.id as number,
    metadata: keyring.metadata as T,
  }));
}

export const getKeyringModule = createModule((/* key */) => {
  // const channels = getChannels(key);
  // const data = getDataModule(key);
  const { postToOne } = createJobWorker();

  const [active, setActive] = createSignal<Keyring<unknown> | undefined>(undefined);
  const exposedActive = createDerived(() => (active() ? { ...active() } : undefined));

  return {
    active: exposedActive as <T>() => Keyring<T> | undefined,
    clearActive() {
      setActive(undefined);
    },
    create<T>(options: CreateSessionRequest<T>) {
      return new Promise<CreateSessionResult>((resolve) => {
        postToOne({ action: 'session.create', payload: options }, ({ payload }) => {
          resolve(payload);
        });
      });
    },
    getAll: getAllKeyrings,
  };
});
