import { describe, expect, test } from 'vitest';
import { getModule } from '../modules/modules';
import { state } from '../state';
import { getChannels } from './channels';

describe('Channels', () => {
  test('get via module loader', () => {
    const value = getModule(state).channels;
    expect(value).toBeInstanceOf(Array);
    expect(getModule(state).channels).toBe(value);
    expect(getModule(state, 'different').channels).not.toBe(value);
  });

  test('get via public API', () => {
    const value = getChannels();
    expect(value).toBeInstanceOf(Array);
    expect(getChannels()).toBe(value);
    expect(getChannels('different')).not.toBe(value);
  });
});
