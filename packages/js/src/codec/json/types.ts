import type { CodecProps } from '../types';

export type JsonCodecProps = Pick<CodecProps, 'instanceID'>;

/** A plugin interface providing functions to hook into the native `JSON` API. */
export interface JsonCodecPlugin {
  /**
   * A function that alters the output of the stringifier. See
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#replacer
   */
  replacer?: (key: string, value: unknown, props: JsonCodecProps) => unknown;
  /**
   * A function that alters the output of the parser. See
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#reviver
   */
  reviver?: (key: string, value: unknown, props: JsonCodecProps) => unknown;
}
