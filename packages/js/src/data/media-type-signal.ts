import { signal, type SignalGetter } from '@adamantjs/signals';
import { format, parse, type MediaType } from 'content-type';

function setter<T>(
  this: [chainedReturn: T, set: (mediaType: MediaType) => void],
  mediaType: string | MediaType,
) {
  const [chainedReturn, set] = this;
  if (typeof mediaType === 'string') {
    set(parse(mediaType));
  } else {
    format(mediaType);
    set(mediaType);
  }
  return chainedReturn;
}

/**
 * Creates a media type signal that uses method chaining and accepts either a `MediaType` object as
 * defined by the `content-type` library or a valid media type string.
 *
 * @param chainedReturn The value to return from the setter.
 * @param {MediaType} [initialValue] Defaults to `{ type: 'application/octet-stream' }` if omitted.
 */
export function mediaTypeSignal<T>(
  chainedReturn: T,
  initialValue: MediaType = { type: 'application/octet-stream' },
): [SignalGetter<MediaType>, (mediaType: string | MediaType) => T] {
  const [get, set] = signal<MediaType>(initialValue);
  return [get, setter.bind<(mediaType: string | MediaType) => T>([chainedReturn, set])];
}
