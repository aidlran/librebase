import { UnsupportedMediaTypeError } from '../errors/unsupported-media-type';
import type { Injector } from '../modules/modules';
import { codecMap } from './codec-map';

export function getCodec(this: Injector) {
  const codecs = this(codecMap);
  return (mediaType: string) => {
    const codec = codecs[mediaType];
    if (!codec) throw new UnsupportedMediaTypeError(mediaType);
    return codec;
  };
}
