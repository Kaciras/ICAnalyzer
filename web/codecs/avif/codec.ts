import type { EncodeOptions } from "squoosh/codecs/avif/enc/avif_enc";
import encodeWasmUrl from "squoosh/codecs/avif/enc/avif_enc.wasm";
import decodeWasmUrl from "squoosh/codecs/avif/dec/avif_dec.wasm";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import type { DecodeModule, EncodeModule } from "../common";

export async function getEncodeModule() {
	const module = await import("squoosh/codecs/avif/enc/avif_enc");
	return initEmscriptenModule<EncodeModule<EncodeOptions>>(module.default, encodeWasmUrl);
}

export async function getDecodeModule() {
	const module = await import("squoosh/codecs/avif/dec/avif_dec");
	return initEmscriptenModule<DecodeModule>(module.default, decodeWasmUrl);
}
