import { IdentifierRegistry } from '@librebase/core';
import { FS } from './schema';

export function init(instanceID?: string) {
  IdentifierRegistry.register(FS, { instanceID });
}
