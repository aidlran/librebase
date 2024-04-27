import type { CodecProps } from '../types';

export type JsonCodecProps = Pick<CodecProps, 'instanceID'>;

/**
 * A plugin interface providing functions to hook into the JSON stringification and
 * destringification processes.
 */
export interface JsonCodecPlugin {
  /**
   * A function that may alter the output of the stringifier. This function behaves similarly to the
   * replacer option of `JSON.stringify`. It will be called recursively for each key/value pair of
   * an object and each entry of an array. It will throw an error if a circular reference is
   * encountered.
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
   * A function that may alter the output of the parser. This function behaves similarly to the
   * reviver option of `JSON.parse`. It will be called recursively for each key/value pair of an
   * object and each entry of an array. It will throw an error if a circular reference is
   * encountered.
   *
   * Revivers are called in order of the plugin being registered.
   *
   * The reviver can return a new value which replaces that item of the JSON structure and this may
   * be async, returning a promise to await. Otherwise it should return the item unchanged.
   *
   * When the item has been "revived," subsequent revivers are not invoked and the parser moves onto
   * the next item.
   */
  reviver?: (key: string | number | undefined, value: unknown, props: JsonCodecProps) => unknown;
}
