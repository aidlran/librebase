import { parse, type MediaType } from 'content-type';
import { getModule } from '../modules/modules';
import { codecMap } from './codec-map';
import type { Codec } from './types';

export function registerCodec(mediaType: string | MediaType, codec?: Codec, instanceID?: string) {
  const codecs = getModule(codecMap, instanceID);
  const mediaTypeString = (typeof mediaType === 'string' ? parse(mediaType) : mediaType).type;
  codecs[mediaTypeString] = codec;
}
