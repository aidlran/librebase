import { CodecRegistry, FS, type Codec } from '../../immutable/index.js';
import { json } from '../../json/codec.js';
import { binary } from '../../middleware/binary.js';
import { IdentifierRegistry } from '../../core/identifiers.js';
import { WrapMiddleware, WrapRegistry } from '../../wraps/index.js';
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
