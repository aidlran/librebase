import { getChannels } from '@librebase/core';
import { unwrap, wrap } from '@librebase/wraps';
import { Buffer } from 'buffer';
import {
  KEYRINGS_INSTANCE_ID,
  type HostOriginMessageConfig,
  type WorkerOriginMessageConfig,
} from '../shared/index.js';
import { createDispatch } from '../shared/rpc/dispatch.js';
import { createResponder } from '../shared/rpc/responder.js';
import { getIdentity } from './service/identity.js';
import { clearKeyring, createKeyring, importKeyring, loadKeyring } from './service/keyring.js';

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

const dispatch = createDispatch<WorkerOriginMessageConfig>(self);

getChannels(KEYRINGS_INSTANCE_ID).push({
  delete: (id) => dispatch('delete', id.bytes, KEYRINGS_INSTANCE_ID),
  get: (id) => dispatch('get', id.bytes, KEYRINGS_INSTANCE_ID),
  put: (id, content) => dispatch('put', { id: id.bytes, content }, KEYRINGS_INSTANCE_ID),
});

self.postMessage('ready');
