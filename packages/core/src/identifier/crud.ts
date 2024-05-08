import { queryChannelsSync } from '../channel';
import { getModule } from '../internal';
import { state } from '../state';
import type { IdentifierSchema } from './schema';
import { encodeIdentifier } from './serialization';

export function getByIdentifier<T>(
  type: number,
  value: ArrayLike<number> | ArrayBufferLike,
  instanceID?: string,
) {
  const schema = getModule(state, instanceID).identifiers[type] as IdentifierSchema<T>;
  if (!schema) {
    throw new ReferenceError('No IdentifierSchema for type ' + type);
  }
  const identifier = encodeIdentifier(type, value);
  return queryChannelsSync(async (channel) => {
    if (channel.getObject) {
      const object = await channel.getObject(identifier);
      if (object) {
        return await Promise.resolve(schema.parse(value, object));
      }
    }
  });
}
