import { json as codec } from '../codec';
import { binary } from '../middleware';
import type { JsonCodecMiddleware } from '../types';

/**
 * Extensible JSON codec for the `application/json` media type with structured data values. Values
 * are first encoded as JSON strings before being converted to bytes. Plugins can provide replacer
 * and reviver functions that hook into the stringification and destringification processes.
 *
 * This recommended configuration registers the binary middleware.
 */
export function json(...middlewares: JsonCodecMiddleware[]) {
  return codec(binary, ...middlewares);
}
