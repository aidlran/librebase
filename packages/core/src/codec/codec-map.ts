import type { Injector } from '../modules/modules';
import type { Codec } from './types';

export type CodecMap = Partial<Record<string, Codec>>;

export function codecMap(this: Injector): CodecMap {
  return {};
}
