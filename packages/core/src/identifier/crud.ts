import { queryChannelsAsync, queryChannelsSync } from '../channel';
import { getModule } from '../internal';
import { state } from '../state';
import type { IdentifierSchema } from './schema';

function getIdentifierSchema<T>(type: number, instanceID?: string) {
  const schema = getModule(state, instanceID).identifiers[type] as IdentifierSchema<T>;
  if (!schema) {
    throw new ReferenceError('No schema registered for identifier type ' + type);
  }
  return schema;
}

export function deleteByIdentifier(
  identifier: ArrayLike<number> | ArrayBufferLike,
  instanceID?: string,
) {
  return queryChannelsAsync((channel) => channel.delete?.(new Uint8Array(identifier)), instanceID);
}

export function getByIdentifier<T>(
  identifier: ArrayLike<number> | ArrayBufferLike,
  instanceID?: string,
) {
  identifier = new Uint8Array(identifier);
  const schema = getIdentifierSchema<T>((identifier as Uint8Array)[0], instanceID);
  return queryChannelsSync(async (channel) => {
    const content = await channel.get?.(identifier as Uint8Array);
    if (content) {
      return await Promise.resolve(schema.parse((identifier as Uint8Array).subarray(1), content));
    }
  }, instanceID);
}

export function putByIdentifier(
  identifier: ArrayLike<number> | ArrayBufferLike,
  content: ArrayLike<number> | ArrayBufferLike,
  instanceID?: string,
) {
  identifier = new Uint8Array(identifier);
  content = new Uint8Array(content);
  getIdentifierSchema((identifier as Uint8Array)[0], instanceID).parse(identifier, content);
  return queryChannelsAsync(
    (channel) => channel.put?.(identifier as Uint8Array, content as Uint8Array),
    instanceID,
  );
}
