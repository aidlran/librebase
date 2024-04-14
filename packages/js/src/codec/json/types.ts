import type { CodecProps } from '../types';

export type JsonCodecProps = Pick<CodecProps, 'instanceID'>;

/** A plugin interface providing functions to hook into the JSON parsing and stringification process. */
export interface JsonCodecPlugin {
  /**
   * A function that may alter the output of the stringifier. This function behaves similarly to the
   * replacer option of `JSON.stringify`. It will be called recursively for each key/value pair of
   * an object and each entry of an array. It will throw if a circular reference is encountered.
   *
   * Replacers are called in order of the plugin being registered.
   *
   * The replacer can return a new value which replaces that item of the JSON structure and this may
   * be async, returning a promise to await. Otherwise it should return the item unchanged.
   *
   * When the item has been "replaced," subsequent replacers are not invoked and the stringifier
   * moves onto the next item.
   */
  replacer?: (key: string | number | undefined, value: unknown, props: JsonCodecProps) => unknown;
  /**
   * A function that alters the output of the parser. See
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#reviver
   */
  reviver?: (key: string, value: unknown, props: JsonCodecProps) => unknown;
}
