import type { Injector } from '../modules/modules';
import type { Codec } from './types';

/** @deprecated Use `@librebase/fs` */
export type CodecMap = Partial<Record<string, Codec>>;

/** @deprecated Use `@librebase/fs` */
export function codecMap(this: Injector): CodecMap {
  return {};
}
