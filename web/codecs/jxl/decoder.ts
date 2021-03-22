import type { JXLModule as DecodeModule } from "squoosh/codecs/jxl/dec/jxl_dec";
import decodeWasmUrl from "squoosh/codecs/jxl/dec/jxl_dec.wasm";

import { initEmscriptenModule } from "squoosh/src/features/worker-utils";

let emscriptenModule: Promise<DecodeModule>;

export async function decode(data: ArrayBuffer): Promise<ImageData> {
	if (!emscriptenModule) {
		const decoder = await import("squoosh/codecs/jxl/dec/jxl_dec");
		emscriptenModule = initEmscriptenModule(decoder.default, decodeWasmUrl);
	}

	const module = await emscriptenModule;

	const result = module.decode(data);
	if (!result) throw new Error("Decoding error");
	return result;
}
