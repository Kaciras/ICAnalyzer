import { simd } from "wasm-feature-detect";
import type { EncodeOptions } from "squoosh/codecs/webp/enc/webp_enc";
import encodeWasmUrl from "squoosh/codecs/webp/enc/webp_enc.wasm";
import encodeWasmSIMDUrl from "squoosh/codecs/webp/enc/webp_enc_simd.wasm";
import decodeWasmUrl from "squoosh/codecs/webp/dec/webp_dec.wasm";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import type { Decoder, Encoder } from "../common";

export { EncodeOptions };

export async function getEncoder() {
	if (await simd()) {
		const webpEncoder = await import("squoosh/codecs/webp/enc/webp_enc_simd");
		return initEmscriptenModule<Encoder<EncodeOptions>>(webpEncoder.default, encodeWasmSIMDUrl);
	}
	const webpEncoder = await import("squoosh/codecs/webp/enc/webp_enc");
	return initEmscriptenModule<Encoder<EncodeOptions>>(webpEncoder.default, encodeWasmUrl);
}

export async function getDecoder() {
	const module = await import("squoosh/codecs/webp/dec/webp_dec");
	return initEmscriptenModule<Decoder>(module.default, decodeWasmUrl);
}
