import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import {
  fakeDelayedDriver,
  fakeErrorDriver,
  fakeValidDriver,
  fakeVoidDriver,
} from '../../testing/drivers';
import { resolveBeforeTimeout } from '../../testing/utils';
import { registerDriver, unregisterDriver } from '../channel';
import { getModule } from '../modules/modules';
import { raceChannels } from './race';

describe('raceChannels', () => {
  it('is a function module', () => {
    expect(getModule(raceChannels)).toBeTypeOf('function');
  });

  it('throws if no channels are registered', () => {
    expect(
      getModule(raceChannels, 'no-channels')(
        () => {},
        () => Promise.resolve({}),
      ),
    ).rejects.toThrow('No channels registered');
  });

  it('resolves after first valid is found - object', () => {
    const instanceID = 'race-channels-first-valid';
    registerDriver(fakeDelayedDriver, instanceID);
    registerDriver(fakeValidDriver, instanceID);
    expect(
      resolveBeforeTimeout(
        getModule(raceChannels, instanceID)(
          (channel) => channel.getNode(new Uint8Array()),
          () => Promise.resolve({}),
        ),
        500,
      ),
    ).resolves.toEqual({});
    unregisterDriver(fakeDelayedDriver, instanceID);
    unregisterDriver(fakeValidDriver, instanceID);
  });

  it('resolves after first valid is found - falsy', () => {
    const instanceID = 'race-channels-first-valid';
    registerDriver(fakeDelayedDriver, instanceID);
    registerDriver(fakeValidDriver, instanceID);
    expect(
      resolveBeforeTimeout(
        getModule(raceChannels, instanceID)(
          (channel) => channel.getNode(new Uint8Array()),
          () => Promise.resolve(0),
        ),
        500,
      ),
    ).resolves.toBe(0);
    unregisterDriver(fakeDelayedDriver, instanceID);
    unregisterDriver(fakeValidDriver, instanceID);
  });

  it('resolves void if all return void', () => {
    const instanceID = 'race-channels-all-void';
    registerDriver(fakeVoidDriver, instanceID);
    expect(
      getModule(raceChannels, instanceID)(
        () => {},
        () => Promise.resolve({}),
      ),
    ).resolves.toBe(undefined);
    unregisterDriver(fakeVoidDriver, instanceID);
  });

  it('resolves void if query throws', () => {
    const instanceID = 'race-channels-error-handling-1';
    registerDriver(fakeValidDriver, instanceID);
    expect(
      getModule(raceChannels, instanceID)(
        () => {
          throw new Error();
        },
        () => Promise.resolve({}),
      ),
    ).resolves.toBe(undefined);
    unregisterDriver(fakeValidDriver, instanceID);
  });

  it('resolves void if validator throws', () => {
    const instanceID = 'race-channels-error-handling-2';
    registerDriver(fakeValidDriver, instanceID);
    expect(
      getModule(raceChannels, instanceID)(
        () => {},
        () => Promise.reject(),
      ),
    ).resolves.toBe(undefined);
    unregisterDriver(fakeValidDriver, instanceID);
  });

  it('resolves void if channel implementation throws', () => {
    const instanceID = 'race-channels-error-handling-3';
    registerDriver(fakeErrorDriver, instanceID);
    expect(
      getModule(raceChannels, instanceID)(
        (channel) => channel.getNode(new Uint8Array()),
        () => Promise.resolve({}),
      ),
    ).resolves.toBe(undefined);
    unregisterDriver(fakeErrorDriver, instanceID);
  });
});
