import type { WrapType, WrapValue } from '../../../../wrap';

interface UnwrapResultMap extends Record<WrapType, unknown> {
  ecdsa: boolean;
  encrypt: Pick<WrapValue<'encrypt'>, 'meta' | 'payload'>;
}

export type UnwrapResult<T extends WrapType = WrapType> = UnwrapResultMap[T];
