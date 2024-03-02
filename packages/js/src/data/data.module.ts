import { channel } from '../channel';
import { createModule } from '../module/create-module';
import { createNode, getNode, type Node } from './node';
import { JsonSerializer, TextSerializer, type Serializer } from './serializer';

export type Serializers = Partial<Record<string, Serializer<unknown>>>;

export interface DataModule {
  createNode(): Node;
  getNode(hash: Uint8Array): Promise<Node | void>;
  registerSerializer(mediaType: string, serializer?: Serializer<unknown>): void;
}

export const getDataModule = createModule<DataModule>((key) => {
  const channels = channel(key);
  const serializers: Serializers = {
    'application/json': JsonSerializer,
    'text/plain': TextSerializer,
  };
  const boundCreateNode = createNode.bind([channels, serializers]);
  return {
    createNode: boundCreateNode,
    getNode: getNode.bind([channels, boundCreateNode]),
    registerSerializer(mediaType: string, serializer?: Serializer<unknown>) {
      serializers[mediaType] = serializer;
    },
  };
});
