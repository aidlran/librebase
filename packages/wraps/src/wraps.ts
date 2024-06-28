import { Base58, Registry, type RegistryModule } from '@astrobase/core/internal';
import {
  Hash,
  HashAlgorithm,
  decodeWithCodec,
  hash,
  parseFileContent,
  serializeFileContent,
} from '@astrobase/immutable';
import type { MediaType } from 'content-type';

export type WrapFn<T = unknown, R = unknown> = (config: {
  hash: Hash;
  metadata: T;
  payload: Uint8Array;
}) => [payload: Uint8Array, metadata: R] | Promise<[payload: Uint8Array, metadata: R]>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface WrapModule<TUnwrappedMetadata = any, TWrappedMetadata = any>
  extends RegistryModule<string> {
  unwrap?: WrapFn<TWrappedMetadata, TUnwrappedMetadata>;
  wrap?: WrapFn<TUnwrappedMetadata, TWrappedMetadata>;
}

export interface WrapConfig<TName extends string = string, TMetadata = unknown> {
  /** The hashing algorithm to use. */
  hashAlg?: HashAlgorithm;
  /** The media type of the value. */
  mediaType: MediaType | string;
  metadata: TMetadata;
  type: TName;
  value: unknown;
}

export interface WrapValue<TName extends string = string, TMetadata = unknown> {
  /** Type. */
  $: `wrap:${TName}`;
  /** The hash of the unwrapped payload. */
  h: string;
  /** Metadata. */
  m: TMetadata;
  /** The wrapped payload. */
  p: Uint8Array;
  /** Version number. */
  v: number;
}

export const WrapRegistry = new Registry<string, WrapModule>({
  validateKey: (key) => typeof key === 'string',
});

export const WrapErrorCode = {
  StrategyUnavailable: 0,
} as const;

/**
 * An error thrown by `@astrobase/wraps`.
 *
 * @category Wraps
 */
export class WrapError extends Error {
  /** The {@linkcode WrapErrorCode}. */
  readonly code: (typeof WrapErrorCode)[keyof typeof WrapErrorCode];

  constructor(readonly message: keyof typeof WrapErrorCode) {
    super(message);
    this.code = WrapErrorCode[message];
  }
}

export function getWrapStrategy<TConfigMetadata = unknown, TValueMetadata = unknown>(
  type: string,
  strategy: 'wrap',
  instanceID?: string,
): WrapFn<TConfigMetadata, TValueMetadata>;
export function getWrapStrategy<TConfigMetadata = unknown, TValueMetadata = unknown>(
  type: string,
  strategy: 'unwrap',
  instanceID?: string,
): WrapFn<TValueMetadata, TConfigMetadata>;
export function getWrapStrategy(
  type: string,
  strategy: 'wrap' | 'unwrap',
  instanceID?: string,
): WrapFn {
  const wrap = WrapRegistry.getStrict(type, instanceID)[strategy];
  if (!wrap) {
    throw new WrapError('StrategyUnavailable');
  }
  return wrap;
}

export async function wrap<
  TName extends string = string,
  TConfigMetadata = unknown,
  TValueMetadata = unknown,
>(
  config: WrapConfig<TName, TConfigMetadata>,
  instanceID?: string,
): Promise<WrapValue<TName, TValueMetadata>> {
  const wrap = getWrapStrategy<TConfigMetadata, TValueMetadata>(config.type, 'wrap', instanceID);
  const unwrappedPayload = await serializeFileContent(config.value, config.mediaType, {
    instanceID,
  });
  const unwrappedHash = await hash(config.hashAlg ?? HashAlgorithm.SHA256, unwrappedPayload);
  const [payload, metadata] = await Promise.resolve(
    wrap({
      hash: unwrappedHash,
      metadata: config.metadata,
      payload: unwrappedPayload,
    }),
  );
  return {
    $: `wrap:${config.type}`,
    h: unwrappedHash.toBase58(),
    m: metadata,
    p: payload,
    v: 1,
  };
}

export async function unwrap<
  TName extends string = string,
  TConfigMetadata = unknown,
  TValueMetadata = unknown,
>(
  value: WrapValue<TName, TValueMetadata>,
  instanceID?: string,
): Promise<WrapConfig<TName, TConfigMetadata>> {
  const type = value.$.slice(5) as TName;
  const unwrap = getWrapStrategy<TConfigMetadata, TValueMetadata>(type, 'unwrap', instanceID);
  const hashBytes = Base58.decode(value.h);
  const hashAlg = hashBytes[0];
  const hash = new Hash(hashAlg, hashBytes.subarray(1));
  const [object, meta] = await Promise.resolve(
    unwrap({
      hash,
      metadata: value.m,
      payload: value.p,
    }),
  );
  const [, mediaType, objectPayload] = parseFileContent(object);
  const unwrappedValue = await decodeWithCodec(objectPayload, mediaType, instanceID);
  return {
    hashAlg,
    mediaType,
    metadata: meta,
    type,
    value: unwrappedValue,
  };
}
