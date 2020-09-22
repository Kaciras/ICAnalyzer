import { WebPEncodeOptions } from "./webp-encoder";

interface WebPModule extends EmscriptenModule {
	encode(data: BufferSource, width: number, height: number, options: WebPEncodeOptions): Uint8Array | null;
}

export default function (opts: Partial<EmscriptenModule>): Promise<WebPModule>;
