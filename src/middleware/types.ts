import type { CodecProps } from '../immutable/codecs.js';

/** Additional properties provided to the middleware. */
export type MiddlewareProps = Pick<CodecProps, 'instanceID'>;

/** A middleware that hooks into the JSON parse and stringification processes. */
export interface JsonCodecMiddleware {
  /**
   * A function that may alter the value that ends up in the stringified output. This function
   * behaves similarly to the replacer function that can be provided to `JSON.stringify`. (See:
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#replacer))
   *
   * @param key If the value is part of an object, this will be the value's key string. If the value
   *   is part of an array, this will be the value's index number. Otherwise this will be
   *   `undefined`.
   * @param value The value.
   * @param props Additional properties provided to the middleware.
   * @returns A value to replace the value within the stringified output. If not replacing the
   *   value, the input value should be returned.
   * @throws If performing some validation and it fails, an error should be thrown.
   */
  replacer?: (key: string | number | undefined, value: unknown, props: MiddlewareProps) => unknown;
  /**
   * A function that may alter the value that ends up in the parsed output. This function behaves
   * similarly to the reviver function that can be provided to `JSON.parse`. (See:
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#reviver))
   *
   * @param key If the value is part of an object, this will be the value's key string. If the value
   *   is part of an array, this will be the value's index number. Otherwise this will be
   *   `undefined`.
   * @param value The value.
   * @param props Additional properties provided to the middleware.
   * @returns A value to replace the value within the parsed output. If not replacing the value, the
   *   input value should be returned.
   * @throws If performing some validation and it fails, an error should be thrown.
   */
  reviver?: (key: string | number | undefined, value: unknown, props: MiddlewareProps) => unknown;
}
