import { describe, vi, it, expect } from 'vitest';
import { error, log, setLogLevel, warn } from './logger';

describe('Logger', () => {
  for (const fn of [error, log, warn]) {
    describe(fn.name, () => {
      it('Logs when log level set to all', () => {
        const spy = vi.spyOn(console, fn.name as keyof Console);
        setLogLevel('all');
        fn({}, 'Logging while enabled test!');
        expect(spy).toHaveBeenCalled();
      });
      it('Does not log when log level set to none', () => {
        const spy = vi.spyOn(console, fn.name as keyof Console);
        setLogLevel('none');
        fn({}, 'Logging while disabled test!');
        expect(spy).not.toHaveBeenCalled();
      });
    });
  }
});
