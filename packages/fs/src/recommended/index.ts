import { IdentifierRegistry } from '@librebase/core';
import { FsSchema } from '../schema';

export function init(instanceID?: string) {
  IdentifierRegistry.register(FsSchema, { instanceID });
}
