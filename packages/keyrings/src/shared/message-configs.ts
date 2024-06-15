import type { WrapConfig, WrapValue } from '@librebase/wraps';
import * as Payload from './message-payloads';
import type { MessageConfig } from './rpc';

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

/** Messages dispatched from child processes. */
export interface WorkerOriginMessageConfig extends MessageConfig {
  delete: [ArrayBuffer, void];
  get: [ArrayBuffer, unknown];
  put: [{ id: ArrayBuffer; content: ArrayBuffer }, void];
}
