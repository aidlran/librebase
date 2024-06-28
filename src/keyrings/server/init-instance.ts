import '../../middleware/index.js'; // TODO: why test breaks without this??
import { IdentifierRegistry } from '../../core/identifiers.js';
import { WrapRegistry } from '../../wraps/index.js';
import { KEYRINGS_INSTANCE_ID as instanceID } from '../shared/constants.js';
import { KeyringIndexIdentifier } from './keyring.js';
import { EncryptWrapSchema } from './wrap/encrypt.js';

IdentifierRegistry.register(KeyringIndexIdentifier, { instanceID });

WrapRegistry.register(EncryptWrapSchema, { instanceID });
