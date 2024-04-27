import { describe, expect, it } from 'vitest';
import {
  fakeDelayedDriver,
  fakeErrorDriver,
  fakeValidDriver,
  fakeVoidDriver,
} from '../../testing/drivers';
import { resolveBeforeTimeout } from '../../testing/utils';
import type { Channels } from './channels';
import { queryChannelsSync } from './query-sync';
import type { Query } from './query-async';
import type { ChannelDriver } from './types';

function normalQuery(channel: ChannelDriver) {
  return channel.getObject!(new ArrayBuffer(0));
}

function throwQuery() {
  throw new Error();
}

describe('Query channels sync', () => {
  it('resolves after first valid found in group', () => {
    expect(
      resolveBeforeTimeout(
        queryChannelsSync([[fakeDelayedDriver, fakeValidDriver]], (channel) => {
          if (channel.getObject!(new ArrayBuffer(0))) return 0;
        }),
        500,
      ),
    ).resolves.toBe(0);
  });

  const shouldResolveVoid: [test: string, query: Query<unknown>, channels: Channels][] = [
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

  for (const [test, query, channels] of shouldResolveVoid) {
    it('should resolve void if ' + test, () => {
      expect(queryChannelsSync(channels, query)).resolves.toBe(undefined);
    });
  }
});
