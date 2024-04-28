import {
  Hash,
  HashAlgorithm,
  base58,
  decodeWithCodec,
  hash,
  parseObject,
  serializeObject,
} from '@librebase/core';
import { getModule } from '@librebase/core/internal';
import type { MediaType } from 'content-type';

export type WrapFn<T = unknown, R = unknown> = (config: {
  hash: Hash;
  metadata: T;
  payload: Uint8Array;
}) => [payload: Uint8Array, metadata: R] | Promise<[payload: Uint8Array, metadata: R]>;

export interface WrapModule<TUnwrappedMetadata = unknown, TWrappedMetadata = unknown> {
  wrap: WrapFn<TUnwrappedMetadata, TWrappedMetadata>;
  unwrap: WrapFn<TWrappedMetadata, TUnwrappedMetadata>;
}

export interface WrapConfig<T = unknown> {
  /** The hashing algorithm to use. */
  hashAlg?: HashAlgorithm;
  /** The media type of the value. */
  mediaType: MediaType | string;
  metadata: T;
  type: string;
  value: unknown;
}

export interface WrapValue<T = unknown> {
  /** Type. */
  $: `wrap:${string}`;
  /** The hash of the unwrapped payload. */
  h: string;
  /** Metadata. */
  m: T;
  /** The wrapped payload. */
  p: Uint8Array;
  /** Version number. */
  v: number;
}

function wrapMap(): Record<string, WrapModule> {
  return {};
}

export function registerWrapModule(type: string, module: WrapModule, instanceID?: string) {
  getModule(wrapMap, instanceID)[type] = module;
}

export function getWrapModule(type: string, instanceID?: string): WrapModule {
  const module = getModule(wrapMap, instanceID)[type];
  if (!module) {
    throw new ReferenceError('No wrap module found for ' + type);
  }
  return module;
}

export async function wrap(config: WrapConfig, instanceID?: string): Promise<WrapValue> {
  const unwrappedPayload = await serializeObject(config.value, config.mediaType, { instanceID });
  const unwrappedHash = await hash(config.hashAlg ?? HashAlgorithm.SHA256, unwrappedPayload);
  const module = getWrapModule(config.type, instanceID);
  const [payload, metadata] = await Promise.resolve(
    module.wrap({
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

export async function unwrap(value: WrapValue, instanceID?: string): Promise<WrapConfig> {
  const type = value.$.slice(5);
  const module = getWrapModule(type, instanceID);
  const hashBytes = base58.decode(value.h);
  const hashAlg = hashBytes[0];
  const hash = new Hash(hashAlg, hashBytes.subarray(1));
  const [object, meta] = await Promise.resolve(
    module.unwrap({
      hash,
      metadata: value.m,
      payload: value.p,
    }),
  );
  const [, mediaType, objectPayload] = parseObject(object);
  const unwrappedValue = await decodeWithCodec(objectPayload, mediaType);
  return {
    hashAlg,
    mediaType,
    metadata: meta,
    type,
    value: unwrappedValue,
  };
}
