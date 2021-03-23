import type { EncodeOptions } from "squoosh/codecs/wp2/enc/wp2_enc";
import encodeWasmUrl from "squoosh/codecs/wp2/enc/wp2_enc.wasm";
import decodeWasmUrl from "squoosh/codecs/wp2/dec/wp2_dec.wasm";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import type { DecodeModule, EncodeModule } from "../common";

export { EncodeOptions };

export async function getEncodeModule() {
	const module = await import("squoosh/codecs/wp2/enc/wp2_enc");
	return initEmscriptenModule<EncodeModule<EncodeOptions>>(module.default, encodeWasmUrl);
}

export async function getDecodeModule() {
	const module = await import("squoosh/codecs/wp2/dec/wp2_dec");
	return initEmscriptenModule<DecodeModule>(module.default, decodeWasmUrl);
}
