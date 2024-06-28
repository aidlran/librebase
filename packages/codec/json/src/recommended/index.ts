/**
 * Includes functions for automatically registering middleware and the codec.
 *
 * @module Recommended
 */

import { CodecRegistry } from '@astrobase/immutable';
import { json as codec } from '../codec.js';
import { binary } from '../middleware/binary.js';
import type { JsonCodecMiddleware } from '../types.js';

/**
 * Automatically registers the JSON codec and the binary middleware.
 *
 * @param config Configuration options.
 */
export function init(config?: { middlewares?: JsonCodecMiddleware[]; instanceID?: string }) {
  const middlewares = config?.middlewares ?? [];
  CodecRegistry.register(json(...middlewares), { instanceID: config?.instanceID });
}

/**
 * Creates a JSON codec. This recommended configuration automatically registers the binary
 * middleware.
 *
 * @param middlewares Additional middlewares to register.
 * @returns A JSON codec.
 */
export function json(...middlewares: JsonCodecMiddleware[]) {
  return codec(binary, ...middlewares);
}
