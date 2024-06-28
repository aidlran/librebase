import { describe, expect, it, test } from 'vitest';
import {
  fakeDelayedDriver,
  fakeErrorDriver,
  fakeValidDriver,
  fakeVoidDriver,
} from '../../testing/drivers.js';
import { resolveBeforeTimeout } from '../../testing/utils.js';
import {
  getChannels,
  queryChannelsSync,
  type ChannelDriver,
  type Channels,
  type ChannelQuery,
} from './channels.js';
import { Identifier } from './identifiers.js';

test('getChannels', () => {
  const value = getChannels();
  expect(value).toBeInstanceOf(Array);
  expect(getChannels()).toBe(value);
  expect(getChannels('different')).not.toBe(value);
});

describe('Query channels sync', () => {
  function normalQuery(channel: ChannelDriver) {
    return channel.get!(new Identifier([]));
  }

  function throwQuery() {
    throw new Error();
  }

  it('resolves after first valid found in group', () => {
    const instanceID = 'query-channels-sync-resolve-first';
    getChannels(instanceID).push(fakeDelayedDriver, fakeValidDriver);
    const query = (channel: ChannelDriver) => {
      if (channel.get!(new Identifier([]))) {
        return 0;
      }
    };
    expect(resolveBeforeTimeout(queryChannelsSync(query, instanceID), 500)).resolves.toBe(0);
  });

  const shouldResolveVoid: [
    test: string,
    query: ChannelQuery<ChannelDriver, unknown>,
    channels: Channels,
  ][] = [
    ['no channels', normalQuery, []],
    ['no channels', normalQuery, [[]]],
    ['single driver returns void', normalQuery, [fakeVoidDriver]],
    ['Driver group all return void', normalQuery, [[fakeVoidDriver, fakeVoidDriver]]],
    ['query throws with single driver', throwQuery, [fakeValidDriver]],
    ['query throws with driver group', throwQuery, [fakeValidDriver, fakeValidDriver]],
    ['channel implementation throws with single driver', normalQuery, [fakeErrorDriver]],
    [
      'channel implementation throws with driver group',
      normalQuery,
      [fakeErrorDriver, fakeErrorDriver],
    ],
  ];

  for (const [test, query, testChannels] of shouldResolveVoid) {
    getChannels(test).push(...testChannels);
    it('should resolve void if ' + test, () => {
      expect(queryChannelsSync(query, test)).resolves.toBe(undefined);
    });
  }
});
