import { createModule } from '../module/create-module';
import type { ChannelDriver } from './types';

export const getChannels = createModule(() => new Set<ChannelDriver>());
