import type { WP2Module as DecodeModule } from "squoosh/codecs/wp2/dec/wp2_dec";
import decodeWasmUrl from "squoosh/codecs/wp2/dec/wp2_dec.wasm";

import { initEmscriptenModule } from "squoosh/src/features/worker-utils";

let emscriptenModule: Promise<DecodeModule>;

export async function decode(data: ArrayBuffer): Promise<ImageData> {
	if (!emscriptenModule) {
		const decoder = await import("squoosh/codecs/wp2/dec/wp2_dec");
		emscriptenModule = initEmscriptenModule(decoder.default, decodeWasmUrl);
	}

	const module = await emscriptenModule;

	const result = module.decode(data);
	if (!result) throw new Error("Decoding error");
	return result;
}
