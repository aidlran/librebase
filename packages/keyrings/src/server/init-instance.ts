import { json } from '@librebase/codec-json';
import { binary } from '@librebase/codec-json/middleware';
import { IdentifierRegistry } from '@librebase/core';
import { CodecRegistry, FS, type Codec } from '@librebase/fs';
import { WrapRegistry } from '@librebase/wraps';
import { WrapMiddleware } from '@librebase/wraps/middleware';
import { KEYRINGS_INSTANCE_ID as instanceID } from '../shared/constants.js';
import { KeyringIndexIdentifier } from './keyring.js';
import { EncryptWrapSchema } from './wrap/encrypt.js';

IdentifierRegistry.register(FS, { instanceID });
IdentifierRegistry.register(KeyringIndexIdentifier, { instanceID });

CodecRegistry.register(
  {
    key: 'application/octet-stream',
    decode: (v) => v,
    encode: (v) => v,
  } satisfies Codec<Uint8Array>,
  { instanceID },
);

CodecRegistry.register(
  /** @todo(feat): enforce only keyring/index structures allowed */
  json(binary, WrapMiddleware),
  { instanceID },
);

WrapRegistry.register(EncryptWrapSchema, { instanceID });
