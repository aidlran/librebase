import { describe, expect, test } from 'vitest';
import { getModule } from '../modules/modules';
import { channels, getChannels } from './channels';

describe('Channels', () => {
  test('get via module loader', () => {
    const value = getModule(channels);
    expect(value).toBeInstanceOf(Array);
    expect(getModule(channels)).toBe(value);
    expect(getModule(channels, 'different')).not.toBe(value);
  });

  test('get via public API', () => {
    const value = getChannels();
    expect(value).toBeInstanceOf(Array);
    expect(getChannels()).toBe(value);
    expect(getChannels('different')).not.toBe(value);
  });
});
