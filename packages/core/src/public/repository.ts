import { queryChannelsAsync, queryChannelsSync } from './channels';
import { IdentifierRegistry, type IdentifierSchema } from './identifiers';

/**
 * Sends a delete request to all registered channels asynchronously.
 *
 * @category Repository
 * @param id The identifier of the value to delete.
 * @param instanceID The target instance ID where the channels to query are registered.
 * @returns A promise that resolves when all requests have completed.
 */
export async function deleteOne(id: ArrayLike<number> | ArrayBufferLike, instanceID?: string) {
  await queryChannelsAsync((channel) => channel.delete?.(new Uint8Array(id)), instanceID);
}

/**
 * Queries the registered channels synchronously, and channel groups asynchronously, until we
 * receive a value that passes the {@linkcode IdentifierSchema} validation and parsing. If all
 * channels are queried with no successful result, returns `void`.
 *
 * @category Repository
 * @param id The identifier of the value to get.
 * @param instanceID The target instance ID where the channels to query are registered.
 * @returns The value or `void` if no valid value was retrieved.
 */
export function getOne<T>(id: ArrayLike<number> | ArrayBufferLike, instanceID?: string) {
  id = new Uint8Array(id);
  const schema = IdentifierRegistry.getStrict(
    (id as Uint8Array)[0],
    instanceID,
  ) as IdentifierSchema<T>;
  return queryChannelsSync(async (channel) => {
    const content = await channel.get?.(id as Uint8Array);
    if (content) {
      return await Promise.resolve(
        schema.parse((id as Uint8Array).subarray(1), content, instanceID),
      );
    }
  }, instanceID);
}

/**
 * Sends a put request to all channels asynchronously to store an identifier/value pair. The pair
 * will first be validated and, if successful, the requests will be made.
 *
 * @category Repository
 * @param id The identifier.
 * @param value The value.
 * @param instanceID The target instance ID where the channels to query are registered.
 * @returns A promise that resolves when all requests have completed.
 */
export async function putOne(
  id: ArrayLike<number> | ArrayBufferLike,
  value: ArrayLike<number> | ArrayBufferLike,
  instanceID?: string,
) {
  id = new Uint8Array(id);
  value = new Uint8Array(value);
  IdentifierRegistry.getStrict((id as Uint8Array)[0], instanceID).parse(
    (id as Uint8Array).subarray(1),
    value,
    instanceID,
  ) &&
    (await queryChannelsAsync(
      (channel) => channel.put?.(id as Uint8Array, value as Uint8Array),
      instanceID,
    ));
}
