import { createDerived, createSignal } from '@adamantjs/signals';
// import { getChannels } from '../channel/channel.module';
// import { getDataModule } from '../data/data.module';
import { getAll } from '../indexeddb/indexeddb';
import { createModule } from '../module/create-module';
import type {
  CreateSessionRequest,
  CreateSessionResult,
  ImportSessionRequest,
  LoadSessionResult,
} from '../worker/types';
import { createJobWorker } from '../worker/worker.module';
import type { Keyring } from './types';

export const getKeyringModule = createModule((/* key */) => {
  // const channels = getChannels(key);
  // const data = getDataModule(key);
  const { postToAll, postToOne } = createJobWorker();

  const [active, setActive] = createSignal<Keyring<unknown> | undefined>(undefined);
  const exposedActive = createDerived(() => (active() ? { ...active() } : undefined));

  return {
    active: exposedActive as <T>() => Keyring<T> | undefined,

    activate<T>(id: number, passphrase: string) {
      return new Promise<LoadSessionResult<T>>((resolve) => {
        postToAll({ action: 'session.load', payload: { id, passphrase } }, ([{ payload }]) => {
          setActive(payload);
          resolve(payload as Keyring<T>);
        });
      });
    },
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
    async getAll<T>(): Promise<Keyring<T>[]> {
      const keyrings = await getAll('session');
      return keyrings.map((keyring) => ({
        id: keyring.id as number,
        metadata: keyring.metadata as T,
      }));
    },
    import<T>(options: ImportSessionRequest<T>) {
      return new Promise<number>((resolve) => {
        postToOne({ action: 'session.import', payload: options }, ({ payload }) => {
          resolve(payload.id);
        });
      });
    },
  };
});
