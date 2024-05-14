import {
  Hash,
  HashAlgorithm,
  base58,
  decodeWithCodec,
  hash,
  parseFsContent,
  serializeFsContent,
} from '@librebase/core';
import { getModule, warn } from '@librebase/core/internal';
import type { MediaType } from 'content-type';

export type WrapFn<T = unknown, R = unknown> = (config: {
  hash: Hash;
  metadata: T;
  payload: Uint8Array;
}) => [payload: Uint8Array, metadata: R] | Promise<[payload: Uint8Array, metadata: R]>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface WrapModule<TUnwrappedMetadata = any, TWrappedMetadata = any> {
  canUnwrap?: string[];
  canWrap?: string[];
  unwrap?: WrapFn<TWrappedMetadata, TUnwrappedMetadata>;
  wrap?: WrapFn<TUnwrappedMetadata, TWrappedMetadata>;
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

function wrapModuleMap(): Record<string, Pick<WrapModule, 'wrap' | 'unwrap'>> {
  return {};
}

export function validateWrapModule(module: WrapModule) {
  void warn(() => {
    const warnings: string[] = [];
    if (module.canWrap && !module.wrap) {
      warnings.push('Defines `canWrap` but not `wrap`.');
    }
    if (module.canUnwrap && !module.unwrap) {
      warnings.push('Defines `canUnwrap` but not `unwrap`.');
    }
    if (warnings.length) {
      warnings.unshift('Wrap module format is invalid:');
    }
    return warnings;
  });
}

export function registerWrapModule<T extends WrapModule>(
  module: T,
  options?: { instanceID?: string; type?: string },
) {
  validateWrapModule(module);
  const moduleConfig = getModule(wrapModuleMap, options?.instanceID);
  if (options?.type) {
    moduleConfig[options.type].unwrap = module.unwrap;
    moduleConfig[options.type].wrap = module.wrap;
  } else {
    if (module.canUnwrap && module.unwrap) {
      for (const type of module.canUnwrap) {
        const configModule = (moduleConfig[type] ??= {});
        configModule.unwrap = module.unwrap;
      }
    }
    if (module.canWrap && module.wrap) {
      for (const type of module.canWrap) {
        const configModule = (moduleConfig[type] ??= {});
        configModule.wrap = module.wrap;
      }
    }
  }
}

export function getWrapStrategy(type: string, dir: 'unwrap' | 'wrap', instanceID?: string): WrapFn {
  const module = getModule(wrapModuleMap, instanceID)[type];
  if (!module?.[dir]) {
    throw new ReferenceError(`No strategy found for ${dir} ${type}`);
  }
  return module[dir]!;
}

export async function wrap(config: WrapConfig, instanceID?: string): Promise<WrapValue> {
  const unwrappedPayload = await serializeFsContent(config.value, config.mediaType, { instanceID });
  const unwrappedHash = await hash(config.hashAlg ?? HashAlgorithm.SHA256, unwrappedPayload);
  const wrap = getWrapStrategy(config.type, 'wrap', instanceID);
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

export async function unwrap(value: WrapValue, instanceID?: string): Promise<WrapConfig> {
  const type = value.$.slice(5);
  const unwrap = getWrapStrategy(type, 'unwrap', instanceID);
  const hashBytes = base58.decode(value.h);
  const hashAlg = hashBytes[0];
  const hash = new Hash(hashAlg, hashBytes.subarray(1));
  const [object, meta] = await Promise.resolve(
    unwrap({
      hash,
      metadata: value.m,
      payload: value.p,
    }),
  );
  const [, mediaType, objectPayload] = parseFsContent(object);
  const unwrappedValue = await decodeWithCodec(objectPayload, mediaType);
  return {
    hashAlg,
    mediaType,
    metadata: meta,
    type,
    value: unwrappedValue,
  };
}
