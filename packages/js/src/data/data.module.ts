import type { ChannelDriver } from '../channel/types';
import { createModule } from '../module/create-module';
import { createNode } from './node';
import type { Serializer } from './serializer/type';

export type Serializers = Record<string, Serializer>;

export const getDataModule = createModule(() => {
  const channels = new Array<ChannelDriver>();
  const serializers: Serializers = {};
  return {
    createNode: createNode.bind([channels, serializers]),
    registerSerializer(mediaType: string, serializer: Serializer) {
      serializers[mediaType] = serializer;
    },
  };
});
