import { describe, expect, it } from 'vitest';
import {
  fakeDelayedDriver,
  fakeErrorDriver,
  fakeValidDriver,
  fakeVoidDriver,
} from '../../testing/drivers';
import { resolveBeforeTimeout } from '../../testing/utils';
import { getModule } from '../modules/modules';
import { state } from '../state';
import type { Channels } from './channels';
import type { Query } from './query-async';
import { queryChannelsSync } from './query-sync';
import type { ChannelDriver } from './types';

function normalQuery(channel: ChannelDriver) {
  return channel.getObject!(new ArrayBuffer(0));
}

function throwQuery() {
  throw new Error();
}

describe('Query channels sync', () => {
  it('resolves after first valid found in group', () => {
    const instanceID = 'query-channels-sync-resolve-first';
    getModule(state, instanceID).channels.push(fakeDelayedDriver, fakeValidDriver);
    const query = (channel: ChannelDriver) => {
      if (channel.getObject!(new ArrayBuffer(0))) {
        return 0;
      }
    };
    expect(resolveBeforeTimeout(queryChannelsSync(query, instanceID), 500)).resolves.toBe(0);
  });

  const shouldResolveVoid: [
    test: string,
    query: Query<ChannelDriver, unknown>,
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
    getModule(state, test).channels.push(...testChannels);
    it('should resolve void if ' + test, () => {
      expect(queryChannelsSync(query, test)).resolves.toBe(undefined);
    });
  }
});
