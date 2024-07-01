/* eslint-disable no-console */

/**
 * Log verbosity levels - from least to most verbose.
 *
 * @category Logging
 */
export const logLevels = ['none', 'error', 'warn', 'log', 'all'] as const;

/**
 * Log verbosity levels as a union type inferred from {@linkcode logLevels}.
 *
 * @category Logging
 */
export type LogLevel = (typeof logLevels)[number];

/**
 * The set of enabled log verbosity levels. This is repopulated when {@linkcode setLogLevel} is
 * called.
 *
 * @category Logging
 */
const enabledLogLevels = new Set<LogLevel>();

/**
 * Globally sets the log verbosity level. Logs of a greater verbosity level than the active log
 * verbosity level will not be output.
 *
 *     setLogLevel('all');
 *
 * @category Logging
 */
export function setLogLevel(desiredLevel: LogLevel) {
  enabledLogLevels.clear();
  for (const level of logLevels) {
    enabledLogLevels.add(level);
    if (desiredLevel === level) {
      return;
    }
  }
  void log(() => [`Log level set to ${desiredLevel}`]);
}

/**
 * Sends a message to the logger to be processed.
 *
 *     Log(() => ['Something happened'], 'log');
 *
 * @category Logging
 * @param messages A function that returns an array of messages or a promise that resolves to an
 *   array of messages. The array of messages works in the same way as arguments to `console.log`
 *   do.
 * @param level The log verbosity level for the message. If this level is more verbose than the
 *   enabled log level then the log will not be output.
 * @returns A promise that resolves once the log has been processed and output (or ignored).
 */
export async function log(
  messages: () => unknown[] | Promise<unknown[]>,
  level: Exclude<LogLevel, 'none' | 'all'> = 'log',
) {
  if (!enabledLogLevels.has(level)) {
    return;
  }
  const logFn = level === 'warn' || level === 'error' ? console[level] : console.log;
  logFn(`${level}: Astrobase:`, ...(await Promise.resolve(messages())));
}

// Set the default log verbosity level
setLogLevel('warn');
