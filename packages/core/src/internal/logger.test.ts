import { describe, vi, it, expect } from 'vitest';
import { log, setLogLevel } from './logger';

describe('Logger', () => {
  for (const fn of ['error', 'log', 'warn'] as const) {
    describe(fn, () => {
      it('Logs when log level set to all', async () => {
        const spy = vi.spyOn(console, fn);
        setLogLevel('all');
        await log(() => ['Logging while log level enabled test!'], fn);
        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('Does not log when log level set to none', async () => {
        const spy = vi.spyOn(console, fn);
        setLogLevel('none');
        await log(() => ['Logging while log level disabled test!'], fn);
        expect(spy).not.toHaveBeenCalled();
      });
    });
  }
});
