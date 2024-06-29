/**
 * Intended for internal use. These APIs are considered unstable.
 *
 * @module Internal
 * @category API Reference
 */

/**
 * A value that may or may not be in Promise form.
 *
 * @category General
 */
export type MaybePromise<T> = T | Promise<T>;

export * from './encoding.js';
export * from './logging.js';
export * from './registry.js';
