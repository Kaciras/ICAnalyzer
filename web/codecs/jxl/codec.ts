import type { EncodeOptions } from "squoosh/codecs/jxl/enc/jxl_enc";
import encodeWasmUrl from "squoosh/codecs/jxl/enc/jxl_enc.wasm";
import decodeWasmUrl from "squoosh/codecs/jxl/dec/jxl_dec.wasm";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import type { DecodeModule, EncodeModule } from "../common";

export { EncodeOptions };

export async function getEncodeModule() {
	const module = await import("squoosh/codecs/jxl/enc/jxl_enc");
	return initEmscriptenModule<EncodeModule<EncodeOptions>>(module.default, encodeWasmUrl);
}

export async function getDecodeModule() {
	const module = await import("squoosh/codecs/jxl/dec/jxl_dec");
	return initEmscriptenModule<DecodeModule>(module.default, decodeWasmUrl);
}
