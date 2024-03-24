import { describe, expect, it } from 'vitest';
import { getModule } from '../modules/modules';
import { unwrap } from './unwrap';

describe('wrap', () => {
  it('is a function module', () => {
    expect(getModule(unwrap)).toBeTypeOf('function');
  });
});
