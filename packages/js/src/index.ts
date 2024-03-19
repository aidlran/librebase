import { dataModule } from './data/data.module';
import { keyringModule } from './keyring/keyring.module';
import { getModule } from './modules/modules';

export * from './channel';
export * from './crypto';

export const data = (instanceID?: string) => getModule(dataModule, instanceID);
export * from './data/serializer';
export type * from './data/data.module';
export type * from './data/node';

export const keyring = (instanceID?: string) => getModule(keyringModule, instanceID);
export type * from './keyring/identity';
export type * from './keyring/keyring.module';
