import { queryChannelsAsync, queryChannelsSync } from '../channel';
import { getModule } from '../internal';
import { state } from '../state';
import type { IdentifierSchema } from './schema';

export function getIdentifierSchema<T>(type: number, instanceID?: string) {
  const schema = getModule(state, instanceID).identifiers[type] as IdentifierSchema<T>;
  if (!schema) {
    throw new ReferenceError('No schema registered for identifier type ' + type);
  }
  return schema;
}

export async function deleteOne(id: ArrayLike<number> | ArrayBufferLike, instanceID?: string) {
  await queryChannelsAsync((channel) => channel.delete?.(new Uint8Array(id)), instanceID);
}

export function getOne<T>(id: ArrayLike<number> | ArrayBufferLike, instanceID?: string) {
  id = new Uint8Array(id);
  const schema = getIdentifierSchema<T>((id as Uint8Array)[0], instanceID);
  return queryChannelsSync(async (channel) => {
    const content = await channel.get?.(id as Uint8Array);
    if (content) {
      return await Promise.resolve(
        schema.parse((id as Uint8Array).subarray(1), content, instanceID),
      );
    }
  }, instanceID);
}

export async function putOne(
  id: ArrayLike<number> | ArrayBufferLike,
  value: ArrayLike<number> | ArrayBufferLike,
  instanceID?: string,
) {
  id = new Uint8Array(id);
  value = new Uint8Array(value);
  getIdentifierSchema((id as Uint8Array)[0], instanceID).parse(
    (id as Uint8Array).subarray(1),
    value,
    instanceID,
  );
  await queryChannelsAsync(
    (channel) => channel.put?.(id as Uint8Array, value as Uint8Array),
    instanceID,
  );
}
