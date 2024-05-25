import { init as initJSON } from '@librebase/codec-json/recommended';
import { ECDSAWrapModule } from './ecdsa';
import { WrapMiddleware } from './middleware';
import { WrapRegistry } from './wraps';

export function init(instanceID?: string) {
  initJSON({ instanceID, middlewares: [WrapMiddleware] });
  WrapRegistry.register(ECDSAWrapModule, { instanceID });
}
