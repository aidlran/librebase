import type { WrapConfig, WrapType } from '../../../../wrap';

export type WrapRequest<T extends WrapType = WrapType> = Omit<
  WrapConfig<T>,
  'mediaType' | 'value'
> & {
  payload: Uint8Array;
};
