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
export type RegisterOptions<K extends RegistryKey> = {
  /** When specified, overrides the key(s) that the module is registered with. */
  key?: K | Array<K>;

  /**
   * When set to true, if a module is already registered with the target key, that module will be
   * replaced with the one being registered.
   */
  force?: boolean;
} & (
  | {
      /** If true, the module is registered at the global level. */
      global?: false;

      /**
       * When registering at the instance level:
       *
       * - If set, will register for that instance.
       * - If left undefined, will register for the default instance.
       */
      instanceID?: string;
    }
  | {
      /** If true, the module is registered at the global level. */
      global: true;
    }
);

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
 * Astrobase is designed to be modular and extensible, and, as such, many features use a strategy
 * pattern to be able to allow users to register or override functionality in a plugin-like way. The
 * `Registry` class is a common implementation of this pattern that can be shared across the
 * ecosystem to keep things consistent, but also to reduce code duplication.
 *
 * Features like the Codec and Middleware systems expose an instance of `Registry` to allow users to
 * register Codecs and Middlewares.
 *
 * ## Order of Precendence
 *
 * The `Registry` class has three levels:
 *
 * 1. Default - "built in" modules provided by the constructor of the `Registry`, available across all
 *    instances.
 * 2. Global - user provided modules, available across all instances.
 * 3. Instance - user provided modules, available to a particular instance.
 *
 * Each level takes precedent over the last - so, for example, if a module has been provided for the
 * same key at both the global and instance levels, the instance level module is the one that is
 * retrieved by {@linkcode get} and {@linkcode getStrict}.
 *
 * ## Options
 *
 * When creating a `Registry` a {@linkcode RegistryOptions} object may be provided to provide
 * defaults, and validation for registration keys and values (modules).
 *
 * TypeScript type parameters may also be provided to restrict the key and module types. The module
 * type must extend {@linkcode RegistryModule}`<K>` which has a mechanism for a module optionally
 * defining its key.
 *
 * ## Example
 *
 * Using TypeScript and providing type parameters:
 *
 * ```ts
 * interface Encoder extends RegistryModule<string> {
 *   encode(value): ArrayBuffer;
 *   decode(value): string;
 * }
 *
 * const EncoderRegistry = new Registry<string, Encoder>({
 *   validateKey: (k) => typeof k === 'string',
 *   validateModule: (m) => typeof m.encode === 'function' && typeof m.decode === 'function',
 * });
 * ```
 *
 * @category Registry
 * @template K The type used for keys.
 * @template T The type used for modules.
 */
export class Registry<K extends RegistryKey, T extends RegistryModule<K>> {
  /** @ignore */
  private readonly global = new Map<K, T>();

  /** @ignore */
  private readonly instance: Partial<Record<string, Map<K, T>>> = {};

  /**
   * @template K The type used for keys.
   * @template T The type used for modules.
   * @param options Registry construction options.
   */
  constructor(private readonly options?: RegistryOptions<K, T>) {}

  /**
   * Gets a module safely, by key. If not found, this method will simply return `void`. See
   * {@linkcode Registry} for more on the order of precedence when retrieving modules.
   *
   * @param key The key of the target module.
   * @param instanceID The target instance ID.
   * @returns The module or `undefined` if no module is registered with the key.
   */
  get(key: K, instanceID?: string): T | undefined {
    return (
      this.instance[instanceID ?? '']?.get(key) ??
      this.global.get(key) ??
      this.options?.defaults?.[key]
    );
  }

  /**
   * Gets a module unsafely. If not found, an error is thrown. See {@linkcode Registry} for more on
   * the order of precedence when retrieving modules.
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
   * Registers a module. A module can be registered either globally or targeted for a specific
   * instance (see {@linkcode Registry} and {@linkcode RegisterOptions}).
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
    const instance = options?.global
      ? this.global
      : (this.instance[options?.instanceID ?? ''] ??= new Map<K, T>());
    if (this.options?.validateKey ?? !options?.force) {
      for (const k of key) {
        if (this.options?.validateKey && !this.options.validateKey(k)) {
          throw new RegistryError(RegistryErrorCode.KeyInvalid);
        }
        if (!options?.force && instance.get(k)) {
          throw new RegistryError(RegistryErrorCode.KeyInUse);
        }
      }
    }
    for (const k of key) {
      instance.set(k, module);
    }
  }
}
