import { describe, vi, it, expect } from 'vitest';
import { error, log, setLoggingEnabled, warn } from './logger';

describe('Logger', () => {
  for (const fn of [error, log, warn]) {
    describe(fn.name, () => {
      it('Logs when logging enabled', () => {
        const spy = vi.spyOn(console, fn.name as keyof Console);
        setLoggingEnabled(true);
        fn('Logging while enabled test!');
        expect(spy).toHaveBeenCalled();
      });
      it('Does not log when logging disabled', () => {
        const spy = vi.spyOn(console, fn.name as keyof Console);
        setLoggingEnabled(false);
        fn('Logging while disabled test!');
        expect(spy).not.toHaveBeenCalled();
      });
    });
  }
});
