import { unwrap, wrap } from '@librebase/wraps';
import { Buffer } from 'buffer';
import { openKeyringDB } from '../keyring/init-db';
import type { HostOriginMessageConfig } from '../shared/message-configs';
import { createResponder } from '../shared/rpc/responder';
import { getIdentity } from './service/identity';
import { clearKeyring, createKeyring, importKeyring, loadKeyring } from './service/keyring';

// Polyfill Buffer for bip32 package
globalThis.Buffer = Buffer;

createResponder<HostOriginMessageConfig>(self, {
  'identity.get': getIdentity as never,
  'keyring.clear': (_, instanceID) => clearKeyring(instanceID),
  'keyring.create': createKeyring as never,
  'keyring.import': importKeyring as never,
  'keyring.load': loadKeyring as never,
  unwrap: unwrap as never,
  wrap: wrap as never,
});

void openKeyringDB().then(() => self.postMessage('ready'));
