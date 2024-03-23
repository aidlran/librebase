import { parse, type MediaType } from 'content-type';
import { getModule } from '../modules/modules';
import { serializerMap } from './serializer-map';
import type { Serializer } from './types';

export function registerSerializer(
  mediaType: string | MediaType,
  serializer?: Serializer,
  instanceID?: string,
) {
  const serializers = getModule(serializerMap, instanceID);
  const mediaTypeString = (typeof mediaType === 'string' ? parse(mediaType) : mediaType).type;
  serializers[mediaTypeString] = serializer;
}
