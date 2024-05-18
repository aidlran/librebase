export type RegistryKey = string | number | symbol;

export interface RegistryValue<K extends RegistryKey> {
  key?: K | Array<K>;
}

export interface RegisterOptions<K extends RegistryKey> {
  /** When specified, overrides the key(s) that the value is registered with. */
  key?: K | Array<K>;

  /**
   * When set to true, if a value is already registered with the target key, value will be replaced
   * with the one being registered.
   */
  force?: boolean;

  /** Sets the instance ID that the value is registered under. */
  instanceID?: string;
}

export const RegistryErrorCode = {
  KeyInvalid: 0,
  KeyInUse: 1,
  KeyMissing: 2,
  ValueInvalid: 3,
  ValueNotFound: 4,
} as const;

export class RegistryError extends Error {
  constructor(readonly code: (typeof RegistryErrorCode)[keyof typeof RegistryErrorCode]) {
    super();
  }
}

export interface RegistryOptions<K extends string | number | symbol, T extends RegistryValue<K>> {
  validateKey?(key: K): boolean;
  validateValue?(value: T): boolean;
}

export class Registry<K extends string | number | symbol, T extends RegistryValue<K>> {
  private readonly registry: Partial<Record<string, Partial<Record<K, T>>>> = {};

  constructor(private readonly options?: RegistryOptions<K, T>) {}

  get(key: K, instanceID?: string): T | undefined {
    return this.registry[instanceID ?? '']?.[key];
  }

  getStrict(key: K, instanceID?: string) {
    const value = this.get(key, instanceID);
    if (!value) {
      throw new RegistryError(RegistryErrorCode.ValueNotFound);
    }
    return value;
  }

  register(value: T, options?: RegisterOptions<K>) {
    if (this.options?.validateValue && !this.options.validateValue(value)) {
      throw new RegistryError(RegistryErrorCode.ValueInvalid);
    }
    let key = options?.key ?? value.key;
    if (key === undefined || key === null) {
      throw new RegistryError(RegistryErrorCode.KeyMissing);
    }
    key = key instanceof Array ? key : [key];
    const instance = (this.registry[options?.instanceID ?? ''] ??= {} as Record<K, T>);
    if (this.options?.validateKey ?? !options?.force) {
      for (const k of key) {
        if (this.options?.validateKey && !this.options.validateKey(k)) {
          throw new RegistryError(RegistryErrorCode.KeyInvalid);
        }
        if (!options?.force && instance[k]) {
          throw new RegistryError(RegistryErrorCode.KeyInUse);
        }
      }
    }
    for (const k of key) {
      instance[k] = value;
    }
  }
}
