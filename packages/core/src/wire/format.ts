import { getModule } from '../modules/modules';

/** Describes a wire format. */
interface WireFormatSchema {
  /** The unique type integer. A table of known types will need to be maintained somewhere. */
  type: number;
}

export function wireFormats(): Record<number, WireFormatSchema> {
  return {};
}

export function registerWireFormat(
  wire: WireFormatSchema,
  options?: {
    /** Overrides the type ID integer that the wire format is registered as. */
    asType: number;
    instanceID?: string;
  },
) {
  getModule(wireFormats, options?.instanceID)[options?.asType ?? wire.type] = wire;
}
