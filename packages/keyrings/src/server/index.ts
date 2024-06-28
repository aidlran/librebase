import { getChannels } from '@astrobase/core';
import { Handlers, createDispatch } from '@astrobase/rpc';
import { unwrap, wrap } from '@astrobase/wraps';
import { Buffer } from 'buffer';
import { KEYRINGS_INSTANCE_ID } from '../shared/index.js';
import { getIdentity } from './identity.js';
import { clearKeyring, createKeyring, importKeyring, loadKeyring } from './keyring.js';

import './init-instance.js';

// Polyfill Buffer for bip32 package
globalThis.Buffer = Buffer;

Handlers.set('identity.get', getIdentity);
Handlers.set('keyring.clear', (_, instanceID) => clearKeyring(instanceID));
Handlers.set('keyring.create', createKeyring);
Handlers.set('keyring.import', importKeyring);
Handlers.set('keyring.load', loadKeyring);
Handlers.set('unwrap', unwrap);
Handlers.set('wrap', wrap);

const dispatch = createDispatch(self);

getChannels(KEYRINGS_INSTANCE_ID).push({
  delete: (id) => dispatch('delete', id.bytes, KEYRINGS_INSTANCE_ID),
  get: (id) => dispatch('get', id.bytes, KEYRINGS_INSTANCE_ID),
  put: (id, content) => dispatch('put', { id: id.bytes, content }, KEYRINGS_INSTANCE_ID),
});

self.postMessage('ready');
