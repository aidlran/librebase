import { registerCodec } from '@librebase/fs';
import { json as codec } from '../codec';
import { binary } from '../middleware';
import type { JsonCodecMiddleware } from '../types';

export function init(config?: { middlewares?: JsonCodecMiddleware[]; instanceID?: string }) {
  const middlewares = config?.middlewares ?? [];
  registerCodec(json(...middlewares), { instanceID: config?.instanceID });
}

/**
 * Extensible JSON codec for the `application/json` media type. This recommended configuration
 * automatically registers the binary middleware.
 */
export function json(...middlewares: JsonCodecMiddleware[]) {
  return codec(binary, ...middlewares);
}
