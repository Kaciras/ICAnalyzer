import { EncodeOptions } from "./avif-encoder";

interface AVIFModule {
	encode(data: BufferSource, width: number, height: number, options: EncodeOptions): Uint8Array | null;
}

export default function (opts: any): AVIFModule;
