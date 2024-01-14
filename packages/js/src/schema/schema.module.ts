import { getChannelModule } from '../channel/channel.module.js';
import { createModule } from '../module/create-module.js';
import { Node } from '../node/class/node.js';
import type { SchemaConfig } from './interface/schema-config.js';

export function createSchema<T = unknown>(netID?: string, config?: SchemaConfig): () => Node<T>;
export function createSchema<T = unknown>(config?: SchemaConfig): () => Node<T>;
export function createSchema<T = unknown>(param1?: string | SchemaConfig, param2?: SchemaConfig) {
  const resolvedNetID = typeof param1 === 'string' ? param1 : undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const resolvedConfig =
    param2 ?? (!resolvedNetID && typeof param1 === 'object' ? param1 : undefined);
  const channelModule = getChannelModule(resolvedNetID);
  return createModule(() => () => new Node<T>(channelModule))(resolvedNetID);
}
