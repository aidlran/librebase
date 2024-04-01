/* eslint-disable no-console */

export let loggingEnabled = false;

export function setLoggingEnabled(value: boolean) {
  loggingEnabled = value;
  log(`Logging is ${loggingEnabled ? 'en' : 'dis'}abled`);
}

export function error(...messages: unknown[]) {
  loggingEnabled && console.error('Librebase:', ...messages);
}

export function log(...messages: unknown[]) {
  loggingEnabled && console.log('Librebase:', ...messages);
}

export function warn(...messages: unknown[]) {
  loggingEnabled && console.warn('Librebase:', ...messages);
}
