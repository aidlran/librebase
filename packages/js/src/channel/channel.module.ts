import type { Node } from '../data/node';
import { createModule } from '../module/create-module';
import type { ChannelDriver, RetrievedNodeData } from './types';

export interface ChannelModule extends Set<ChannelDriver> {
  getNode(
    hash: Uint8Array,
    validator: (data: RetrievedNodeData) => Promise<Node | void>,
  ): Promise<Node | void>;
}

async function getNode(
  this: Set<ChannelDriver>,
  hash: Uint8Array,
  validator: (data: RetrievedNodeData) => Promise<Node | void>,
) {
  return new Promise<Node | void>((resolve) => {
    let resolved = false;
    let todo = this.size;
    for (const channel of this) {
      void Promise.resolve(channel.getNode(hash))
        .then((node) => {
          if (!resolved) {
            if (node) {
              validator(node).then((validNode) => {
                if (!resolved) {
                  if (validNode) {
                    resolved = true;
                    resolve(validNode);
                  } else if (todo == 1) resolve();
                  else todo--;
                }
              });
            } else if (todo == 1) resolve();
            else todo--;
          }
        })
        .catch((error) => {
          if (!resolved) {
            if (todo == 1) resolve();
            else todo--;
          }
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
