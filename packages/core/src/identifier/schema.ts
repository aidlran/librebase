import { getModule } from '../modules/modules';
import { state } from '../state';

/** Describes an identifier. */
export interface IdentifierSchema<T = unknown> {
  /** The unique type integer. A table of known types will need to be maintained somewhere. */
  type: number;
  parse(
    key: ArrayLike<number> | ArrayBufferLike,
    value: ArrayLike<number> | ArrayBufferLike,
    instanceID?: string,
  ): T | void | Promise<T | void>;
}

export interface RegisterIdentifierOptions {
  /** When specified, overrides the type ID integer that the identifier is registered as. */
  asType?: number;
  /**
   * When set to true, if an identifier schema is already registered with the target type integer,
   * that identifier schema will be replaced with the one being registered.
   */
  force?: boolean;
  instanceID?: string;
}

/**
 * An error code thrown if the identifier schema does not specify its own type integer. To solve
 * this you can specify a type integer with `options.asType` when registering the schema. (see
 * {@linkcode RegisterIdentifierOptions.asType})
 *
 * This error code will also be thrown if a bad value for `options.asType` was provided.
 */
export const ERROR_TYPE_MISSING = 0;

/** An error code thrown if the identifier schema does not specify a parse function. */
export const ERROR_PARSE_MISSING = 1;

/**
 * An error code thrown if an identifier schema has already been registered with the target type
 * integer.
 */
export const ERROR_TYPE_IN_USE = 2;

/** An error thrown during {@linkcode registerIdentifier}. */
export class IdentifierRegistrationError extends TypeError {
  constructor(readonly code: 0 | 1 | 2) {
    super();
  }
}

/**
 * Registers an identifier schema.
 *
 * @param schema An {@linkcode IdentifierSchema}.
 * @param options See {@linkcode RegisterIdentifierOptions}.
 * @throws {IdentifierRegistrationError}
 */
export function registerIdentifier(schema: IdentifierSchema, options?: RegisterIdentifierOptions) {
  const type = options?.asType ?? schema.type;
  if (!Number.isInteger(type)) {
    throw new IdentifierRegistrationError(ERROR_TYPE_MISSING);
  }
  if (typeof schema.parse !== 'function') {
    throw new IdentifierRegistrationError(ERROR_PARSE_MISSING);
  }
  const identifiers = getModule(state, options?.instanceID).identifiers;
  if (!options?.force && identifiers[type]) {
    throw new IdentifierRegistrationError(ERROR_TYPE_IN_USE);
  }
  identifiers[type] = schema;
}
