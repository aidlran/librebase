import { parse, type MediaType } from 'content-type';
import { channel } from '../channel';
import { createModule } from '../module/create-module';
import { createNode, getNode, parseSerializedNode, type Node } from './node';
import { JsonSerializer, TextSerializer, type Serializer } from './serializer';

export type Serializers = Partial<Record<string, Serializer<unknown>>>;

export interface DataModule {
  createNode(): Node;
  getNode(hash: Uint8Array): Promise<Node | void>;
  /**
   * Registers a serializer for a given media type. Omitting the serializer parameter will clear the
   * media type's registered serializer instead.
   */
  registerSerializer(mediaType: string | MediaType, serializer?: Serializer<unknown>): void;
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
    getNode: getNode.bind([channels, parseSerializedNode.bind([boundCreateNode])]),
    registerSerializer(mediaType: string | MediaType, serializer?: Serializer<unknown>) {
      const type = (typeof mediaType === 'string' ? parse(mediaType) : mediaType).type;
      serializers[type] = serializer;
    },
  };
});
