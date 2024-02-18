import { getChannels } from '../channel/channel.module';
import type { ChannelDriver } from '../channel/types';
import { createModule } from '../module/create-module';
import { createNode, getNode } from './node';
import { JsonSerializer, TextSerializer, type Serializer } from './serializer';

export type Serializers = Record<string, Serializer<unknown>>;

export const getDataModule = createModule((key) => {
  const channels = getChannels(key);
  const serializers: Serializers = {
    'application/json': JsonSerializer,
    'text/plain': TextSerializer,
  };
  const boundCreateNode = createNode.bind([channels, serializers]);
  return {
    createNode: boundCreateNode,
    getNode: getNode.bind([channels, boundCreateNode]),
    registerChannelDriver(driver: ChannelDriver) {
      channels.add(driver);
    },
    registerSerializer<T>(mediaType: string, serializer: Serializer<T>) {
      serializers[mediaType] = serializer;
    },
  };
});
