import { AVIFEncodeOptions } from "./avif-encoder";

interface AVIFModule {
	encode(data: BufferSource, width: number, height: number, options: AVIFEncodeOptions): Uint8Array | null;
}

export default function (opts: any): AVIFModule;
