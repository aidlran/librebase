import { getChannels } from '../channel/channel.module';
import type { ChannelDriver } from '../channel/types';
import { createModule } from '../module/create-module';
import { createNode, getNode } from './node';
import type { Serializer } from './serializer/type';

export type Serializers = Record<string, Serializer>;

export const getDataModule = createModule((key) => {
  const channels = getChannels(key);
  const serializers: Serializers = {};
  const boundCreateNode = createNode.bind([channels, serializers]);
  return {
    createNode: boundCreateNode,
    getNode: getNode.bind([channels, boundCreateNode]),
    registerChannelDriver(driver: ChannelDriver) {
      channels.add(driver);
    },
    registerSerializer(mediaType: string, serializer: Serializer) {
      serializers[mediaType] = serializer;
    },
  };
});
