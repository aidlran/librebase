import { signal, type SignalGetter } from '@adamantjs/signals';
import { parse, type MediaType } from 'content-type';
import { type Node } from './node';

function setter<T extends Node>(
  this: [node: T, set: (mediaType: MediaType) => void],
  mediaType: string | MediaType,
) {
  const [node, set] = this;
  set(typeof mediaType === 'string' ? parse(mediaType) : mediaType);
  return node;
}

/**
 * Creates a media type signal for use in a `Node` interface. This signal's setter uses method
 * chaining and accepts either a `MediaType` object as defined by the `content-type` library or a
 * valid media type string.
 *
 * @param node The `Node` implementing object to return from the setter.
 * @param {MediaType} [initialValue] Defaults to `{ type: 'application/octet-stream' }` if omitted.
 */
export function mediaTypeSignal<T extends Node>(
  node: T,
  initialValue: MediaType = { type: 'application/octet-stream' },
): [SignalGetter<MediaType>, (mediaType: string | MediaType) => T] {
  const [get, set] = signal<MediaType>(initialValue);
  return [get, setter.bind<(mediaType: string | MediaType) => T>([node, set])];
}
