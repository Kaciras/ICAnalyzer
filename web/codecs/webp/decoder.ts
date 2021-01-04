import type { WebPModule as DecodeModule } from "squoosh/codecs/webp/dec/webp_dec";
import decodeWasmUrl from "squoosh/codecs/webp/dec/webp_dec.wasm";

import { initEmscriptenModule } from "squoosh/src/features/worker-utils";

let emscriptenModule: Promise<DecodeModule>;

export async function decode(data: ArrayBuffer): Promise<ImageData> {
	if (!emscriptenModule) {
		const decoder = await import("squoosh/codecs/webp/dec/webp_dec");
		emscriptenModule = initEmscriptenModule(decoder.default, decodeWasmUrl);
	}

	const module = await emscriptenModule;

	const result = module.decode(data);
	if (!result) throw new Error("Decoding error");
	return result;
}
