import type { EncodeOptions } from "squoosh/codecs/avif/enc/avif_enc";
import encodeWasmUrl from "squoosh/codecs/avif/enc/avif_enc.wasm";
import decodeWasmUrl from "squoosh/codecs/avif/dec/avif_dec.wasm";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import type { Decoder, Encoder } from "../common";

export async function getEncoder() {
	const module = await import("squoosh/codecs/avif/enc/avif_enc");
	return initEmscriptenModule<Encoder<EncodeOptions>>(module.default, encodeWasmUrl);
}

export async function getDecoder() {
	const module = await import("squoosh/codecs/avif/dec/avif_dec");
	return initEmscriptenModule<Decoder>(module.default, decodeWasmUrl);
}
