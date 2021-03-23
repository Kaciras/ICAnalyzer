import type { EncodeOptions } from "squoosh/codecs/wp2/enc/wp2_enc";
import encodeWasmUrl from "squoosh/codecs/wp2/enc/wp2_enc.wasm";
import decodeWasmUrl from "squoosh/codecs/wp2/dec/wp2_dec.wasm";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import type { Decoder, Encoder } from "../common";

export { EncodeOptions };

export async function getEncoder() {
	const module = await import("squoosh/codecs/wp2/enc/wp2_enc");
	return initEmscriptenModule<Encoder<EncodeOptions>>(module.default, encodeWasmUrl);
}

export async function getDecoder() {
	const module = await import("squoosh/codecs/wp2/dec/wp2_dec");
	return initEmscriptenModule<Decoder>(module.default, decodeWasmUrl);
}
