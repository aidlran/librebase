import type { CodecProps } from '@librebase/core';

export type MiddlewareProps = Pick<CodecProps, 'instanceID'>;

/**
 * A middleware that hooks into the JSON stringification and destringification processes. See the
 * README for more information on how to implement a middleware.
 */
export interface JsonCodecMiddleware {
  /** A function that may alter the output of the stringifier. */
  replacer?: (key: string | number | undefined, value: unknown, props: MiddlewareProps) => unknown;
  /** A function that may alter the output of the parser. */
  reviver?: (key: string | number | undefined, value: unknown, props: MiddlewareProps) => unknown;
}
