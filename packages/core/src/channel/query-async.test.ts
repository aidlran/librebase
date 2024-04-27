import { describe, expect, it } from 'vitest';
import { queryChannelsAsync } from './query-async';

describe('Query channels async', () => {
  it('is defined', () => {
    expect(queryChannelsAsync).toBeTypeOf('function');
  });
});
