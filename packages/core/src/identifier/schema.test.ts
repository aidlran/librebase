import { describe, expect, it } from 'vitest';
import { getModule } from '../modules/modules';
import { state } from '../state';
import {
  IdentifierRegistrationError,
  registerIdentifier,
  type IdentifierSchema,
  type RegisterIdentifierOptions,
} from './schema';

describe('Identifier schema registration', () => {
  const goodSchema = { type: 0 };
  const badSchema = {} as IdentifierSchema;

  it('Registers valid schemas', () => {
    const instanceID = 'identifier-register-valid';
    expect(registerIdentifier(goodSchema, { instanceID })).toBeUndefined();
    expect(getModule(state, instanceID).identifiers[goodSchema.type]).toBe(goodSchema);
  });

  it('Registers with a valid asType provided', () => {
    const instanceID = 'identifier-register-valid-asType';
    expect(registerIdentifier(goodSchema, { asType: 1, instanceID })).toBeUndefined();
    expect(registerIdentifier(badSchema, { asType: 2, instanceID })).toBeUndefined();
    const { identifiers } = getModule(state, instanceID);
    expect(identifiers[0]).toBeUndefined();
    expect(identifiers[1]).toBe(goodSchema);
    expect(identifiers[2]).toBe(badSchema);
  });

  it('Throws if the type is missing or invalid', () => {
    const instanceID = 'identifier-register-bad-type';
    expect(() => registerIdentifier({} as never, { instanceID })).toThrow(
      IdentifierRegistrationError,
    );
    for (const type of [3.14, 'abc']) {
      const options: RegisterIdentifierOptions = { instanceID };
      expect(() => registerIdentifier({ type } as IdentifierSchema, options)).toThrow(
        IdentifierRegistrationError,
      );
      options.asType = type as number;
      expect(() => registerIdentifier(goodSchema, options)).toThrow(IdentifierRegistrationError);
    }
  });

  it('Throws if type is in use', () => {
    const instanceID = 'identifier-register-used-type';
    const options: RegisterIdentifierOptions = { instanceID };
    expect(registerIdentifier(goodSchema, options)).toBeUndefined();
    expect(() => registerIdentifier(goodSchema, options)).toThrow(IdentifierRegistrationError);
    options.asType = goodSchema.type;
    expect(() => registerIdentifier({ type: 2 }, options)).toThrow(IdentifierRegistrationError);
    expect(getModule(state, instanceID).identifiers[goodSchema.type]).toBe(goodSchema);
  });
});
