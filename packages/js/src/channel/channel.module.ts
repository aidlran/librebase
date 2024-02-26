import { createModule } from '../module/create-module';
import type { ChannelDriver } from './types';

export interface ChannelModule extends Set<ChannelDriver> {
  getNode(hash: Uint8Array): Promise<[mediaType: string, payload: Uint8Array] | void>;
}

async function getNode(this: Set<ChannelDriver>, hash: Uint8Array) {
  return new Promise<[mediaType: string, payload: Uint8Array] | void>((resolve) => {
    let resolved = false;
    let todo = this.size;
    for (const channel of this) {
      void Promise.resolve(channel.getNode(hash))
        .then((node) => {
          if (!resolved && node) {
            resolved = true;
            resolve(node);
          } else if (todo == 1) {
            resolve();
          }
          todo--;
        })
        .catch((error) => {
          if (todo == 1) {
            resolve();
          }
          todo--;
          throw error;
        });
    }
  });
}

export const getChannelModule = createModule<ChannelModule>(() => {
  const module = new Set<ChannelDriver>();
  (module as ChannelModule).getNode = getNode.bind(module);
  return module as ChannelModule;
});
