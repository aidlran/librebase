/**
 * The type used for the key when registering and retrieving {@linkcode RegistryModule} instances
 * from a {@linkcode Registry}.
 *
 * @category Registry
 */
export type RegistryKey = string | number | symbol;

/**
 * The base interface for modules in a {@linkcode Registry}.
 *
 * @category Registry
 */
export interface RegistryModule<K extends RegistryKey> {
  /** A key or array of keys that this module can automatically be registered with. */
  key?: K | Array<K>;
}

/**
 * Options that can be provided when registering a {@linkcode RegistryModule} in a
 * {@linkcode Registry}.
 *
 * @category Registry
 */
export interface RegisterOptions<K extends RegistryKey> {
  /** When specified, overrides the key(s) that the module is registered with. */
  key?: K | Array<K>;

  /**
   * When set to true, if a module is already registered with the target key, that module will be
   * replaced with the one being registered.
   */
  force?: boolean;

  /** Sets the instance ID that the module will be registered under. */
  instanceID?: string;
}

/**
 * Error codes related to the registry.
 *
 * @category Registry
 */
export const RegistryErrorCode = {
  /** The key already had a module registered and `force` mode was false. */
  KeyInUse: 0,
  /** The value for the key failed validation. */
  KeyInvalid: 1,
  /** No key was specified by the module or options. */
  KeyMissing: 2,
  /** The module failed validation. */
  ModuleInvalid: 3,
  /** The module was not found. */
  ModuleNotFound: 4,
} as const;

/**
 * An error thrown by {@linkcode Registry} methods.
 *
 * @category Registry
 */
export class RegistryError extends Error {
  constructor(
    /** The {@linkcode RegistryErrorCode}. */
    readonly code: (typeof RegistryErrorCode)[keyof typeof RegistryErrorCode],
  ) {
    super();
  }
}

/**
 * Registry construction options.
 *
 * @category Registry
 * @template K The type used for keys.
 * @template T The type used for modules.
 */
export interface RegistryOptions<K extends RegistryKey, T extends RegistryModule<K>> {
  /**
   * A map of global defaults for the registry. Applies across all instances where a module is not
   * provided for the key.
   */
  defaults?: Record<K, T>;
  /**
   * An optional validation function for Registry keys.
   *
   * For instance, the following function will ensure the key is an integer.
   *
   *     (key) => Number.isInteger(key);
   *
   * @param key The key to validate.
   * @returns A boolean indicating whether or not the validation passed.
   */
  validateKey?(key: K): boolean;
  /**
   * An optional validation function for Registry modules.
   *
   * For instance, the following function will ensure the module contains a `parse` function.
   *
   *     (value) => typeof value.parse === 'function';
   *
   * @param value The module to validate.
   * @returns A boolean indicating whether or not the validation passed.
   */
  validateModule?(value: T): boolean;
}

/**
 * A common pattern used by `@astrobase` packages is to allow plugin-like functionality to make the
 * ecosystem extensible. The `Registry` class provides a common implementation for this pattern to
 * keep things consistent. It is used to define key and module types, validation, and provides
 * methods to register and retrieve modules based on those keys.
 *
 *     interface Encoder extends RegistryModule<string> {
 *       encode(value): ArrayBuffer;
 *       decode(value): string;
 *     }
 *
 *     const EncoderRegistry = new Registry<string, Encoder>();
 *
 * @category Registry
 * @template K The type used for keys.
 * @template T The type used for modules.
 */
export class Registry<K extends RegistryKey, T extends RegistryModule<K>> {
  /** @ignore */
  private readonly registry: Partial<Record<string, Partial<Record<K, T>>>> = {};

  /**
   * @template K The type used for keys.
   * @template T The type used for modules.
   * @param options Registry construction options.
   */
  constructor(private readonly options?: RegistryOptions<K, T>) {}

  /**
   * Gets a module safely without throwing.
   *
   * @param key The key of the target module.
   * @param instanceID The target instance ID.
   * @returns The module or `undefined` if no module is registered with the key.
   */
  get(key: K, instanceID?: string): T | undefined {
    return this.registry[instanceID ?? '']?.[key] ?? this.options?.defaults?.[key];
  }

  /**
   * Gets a module unsafely, throwing if not found.
   *
   * @param key The key of the target module.
   * @param instanceID The target instance ID.
   * @returns The module.
   * @throws A {@linkcode RegistryError} if no module is registered with the key.
   */
  getStrict(key: K, instanceID?: string) {
    const value = this.get(key, instanceID);
    if (!value) {
      throw new RegistryError(RegistryErrorCode.ModuleNotFound);
    }
    return value;
  }

  /**
   * Registers a module.
   *
   * @param module A module to register.
   * @param options An optional {@linkcode RegistrationOptions} object.
   */
  register(module: T, options?: RegisterOptions<K>) {
    if (this.options?.validateModule && !this.options.validateModule(module)) {
      throw new RegistryError(RegistryErrorCode.ModuleInvalid);
    }
    let key = options?.key ?? module.key;
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
      instance[k] = module;
    }
  }
}
