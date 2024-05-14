import type { Channels } from './channel';
import type { IdentifierSchema } from './identifier';

export interface State {
  channels: Channels;
  identifiers: Record<number, IdentifierSchema>;
}

export function state(): State {
  return {
    channels: [],
    identifiers: {},
  };
}
