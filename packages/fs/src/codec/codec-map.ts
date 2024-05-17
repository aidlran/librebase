import type { Injector } from '@librebase/core/internal';
import type { Codec } from './types';

export type CodecMap = Partial<Record<string, Codec>>;

export function codecMap(this: Injector): CodecMap {
  return {};
}
