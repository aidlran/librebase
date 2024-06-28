import { IdentifierRegistry } from '@astrobase/core';
import { FS } from './schema.js';

export function init(instanceID?: string) {
  IdentifierRegistry.register(FS, { instanceID });
}
