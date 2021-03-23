import type { EncodeOptions } from "squoosh/codecs/jxl/enc/jxl_enc";
import encodeWasmUrl from "squoosh/codecs/jxl/enc/jxl_enc.wasm";
import decodeWasmUrl from "squoosh/codecs/jxl/dec/jxl_dec.wasm";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import type { Decoder, Encoder } from "../common";

export { EncodeOptions };

export async function getEncoder() {
	const module = await import("squoosh/codecs/jxl/enc/jxl_enc");
	return initEmscriptenModule<Encoder<EncodeOptions>>(module.default, encodeWasmUrl);
}

export async function getDecoder() {
	const module = await import("squoosh/codecs/jxl/dec/jxl_dec");
	return initEmscriptenModule<Decoder>(module.default, decodeWasmUrl);
}
