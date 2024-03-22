export class UnsupportedMediaTypeError extends TypeError {
  constructor(mediaTypeString: string) {
    super(`Unsupported media type '${mediaTypeString}' - no serializer available`);
  }
}
