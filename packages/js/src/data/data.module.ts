import type { ChannelDriver } from '../channel/types';
import { createModule } from '../module/create-module';
import { createNode } from './node';

export const getDataModule = createModule(() => {
  const channels = new Array<ChannelDriver>();
  return {
    createNode: createNode.bind(channels),
  };
});
