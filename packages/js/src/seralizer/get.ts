import { UnsupportedMediaTypeError } from '../errors/unsupported-media-type';
import type { Injector } from '../modules/modules';
import { serializerMap } from './serializer-map';

export function getSerializer(this: Injector) {
  const serializers = this(serializerMap);
  return (mediaType: string) => {
    const serializer = serializers[mediaType];
    if (!serializer) throw new UnsupportedMediaTypeError(mediaType);
    return serializer;
  };
}
