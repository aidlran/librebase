import type { MessageConfig } from '@librebase/rpc';
import type { WrapConfig, WrapValue } from '@librebase/wraps';
import * as Payload from './message-payloads.js';

/** Messages dispatched from the host process. */
export interface HostOriginMessageConfig extends MessageConfig {
  'identity.get': [string, Uint8Array];
  'keyring.clear': [void, void];
  'keyring.create': [Payload.CreateKeyringRequest, Payload.CreateKeyringResult];
  'keyring.import': [Payload.ImportKeyringRequest, Payload.ImportKeyringResult];
  'keyring.load': [Payload.LoadKeyringRequest, Payload.LoadKeyringResult];
  unwrap: [WrapValue, WrapConfig];
  wrap: [WrapConfig, WrapValue];
  e: [void, void];
}
