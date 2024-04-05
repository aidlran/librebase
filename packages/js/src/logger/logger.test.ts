import { describe, vi, it, expect } from 'vitest';
import { error, log, setLogLevel, setLogFeatureEnabled, warn } from './logger';

describe('Logger', () => {
  for (const fn of [error, log, warn]) {
    describe(fn.name, () => {
      it('Logs when log level set to all', async () => {
        const spy = vi.spyOn(console, fn.name as keyof Console);
        setLogLevel('all');
        await fn(() => ['Logging while log level enabled test!']);
        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('Does not log when log level set to none', async () => {
        const spy = vi.spyOn(console, fn.name as keyof Console);
        setLogLevel('none');
        setLogFeatureEnabled('all', true);
        await fn(() => ['Logging while log level disabled test!']);
        expect(spy).not.toHaveBeenCalled();
      });

      it('Logs when log feature enabled', async () => {
        const spy = vi.spyOn(console, fn.name as keyof Console);
        setLogLevel('none');
        setLogFeatureEnabled('all', false);
        setLogFeatureEnabled('wrap', true);
        setLogLevel('all');
        await fn(() => ['Logging while log feature enabled test!'], { feature: 'wrap' });
        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('Does not log when log feature disabled', async () => {
        const spy = vi.spyOn(console, fn.name as keyof Console);
        setLogLevel('none');
        setLogFeatureEnabled('all', false);
        setLogFeatureEnabled('wrap', false);
        setLogLevel('all');
        await fn(() => ['Logging while log feature disabled test!'], { feature: 'wrap' });
        expect(spy).not.toHaveBeenCalled();
      });
    });
  }
});
