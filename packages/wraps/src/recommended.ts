import { init as initJSON } from '@librebase/codec-json/recommended';
import { ECDSAWrapModule } from './ecdsa';
import { WrapMiddleware } from './middleware';
import { registerWrapModule } from './wraps';

export function init(instanceID?: string) {
  initJSON({ instanceID, middlewares: [WrapMiddleware] });
  registerWrapModule(ECDSAWrapModule, { instanceID });
}
