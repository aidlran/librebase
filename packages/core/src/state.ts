import type { IdentifierSchema } from './identifier';

export interface State {
  identifiers: Record<number, IdentifierSchema>;
}

export function state(): State {
  return {
    identifiers: {},
  };
}
