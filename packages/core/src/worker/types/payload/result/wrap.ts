import type { WrapType, WrapValue } from '../../../../wrap';

interface WrapResultMap {
  /** Base 64 encoded signature. */
  ecdsa: string;
  encrypt: Pick<WrapValue<'encrypt'>, 'meta' | 'payload'>;
}

export type WrapResult<T extends WrapType = WrapType> = WrapResultMap[T];