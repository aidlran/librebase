import { registerIdentifier } from '@librebase/core';
import { FsSchema } from '../schema';

export function init(instanceID?: string) {
  registerIdentifier(FsSchema, { instanceID });
}
