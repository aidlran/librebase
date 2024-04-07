import type { WrapType, WrapValue } from '../../../../wrap';

interface WrapResultMap extends Record<WrapType, unknown> {
  /** Base 64 encoded signature. */
  ecdsa: string;
  encrypt: Pick<WrapValue<'encrypt'>, 'metadata' | 'payload'>;
}

export type WrapResult<T extends WrapType = WrapType> = WrapResultMap[T];
