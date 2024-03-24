import { describe, expect, it } from 'vitest';
import { getModule } from '../modules/modules';
import { wrap } from './wrap';

describe('wrap', () => {
  it('is a function module', () => {
    expect(getModule(wrap)).toBeTypeOf('function');
  });
});
