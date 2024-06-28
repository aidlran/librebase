import { WrapMiddleware } from '../wraps/middleware.js';
import { BinaryMiddleware } from './binary.js';
import type { CodecMiddleware } from './types.js';

const middlewares: Partial<Record<string, CodecMiddleware[]>> = {};

export function getMiddlewares(instanceID = '') {
  return (middlewares[instanceID] ??= [BinaryMiddleware, WrapMiddleware]);
}

export function registerMiddleware(middleware: CodecMiddleware, instanceID = '') {
  getMiddlewares(instanceID).push(middleware);
}
