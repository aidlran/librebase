import { init as initJSON } from '@astrobase/codec-json/recommended';
import { ECDSAWrapModule } from './ecdsa.js';
import { WrapMiddleware } from './middleware.js';
import { WrapRegistry } from './wraps.js';

export function init(instanceID?: string) {
  initJSON({ instanceID, middlewares: [WrapMiddleware] });
  WrapRegistry.register(ECDSAWrapModule, { instanceID });
}
