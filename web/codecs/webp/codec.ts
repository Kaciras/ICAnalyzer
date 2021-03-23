import { simd } from "wasm-feature-detect";
import type { EncodeOptions } from "squoosh/codecs/webp/enc/webp_enc";
import encodeWasmUrl from "squoosh/codecs/webp/enc/webp_enc.wasm";
import encodeWasmSIMDUrl from "squoosh/codecs/webp/enc/webp_enc_simd.wasm";
import decodeWasmUrl from "squoosh/codecs/webp/dec/webp_dec.wasm";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import type { DecodeModule, EncodeModule } from "../common";

export { EncodeOptions };

export async function getEncodeModule() {
	if (await simd()) {
		const webpEncoder = await import("squoosh/codecs/webp/enc/webp_enc_simd");
		return initEmscriptenModule<EncodeModule<EncodeOptions>>(webpEncoder.default, encodeWasmSIMDUrl);
	}
	const webpEncoder = await import("squoosh/codecs/webp/enc/webp_enc");
	return initEmscriptenModule<EncodeModule<EncodeOptions>>(webpEncoder.default, encodeWasmUrl);
}

export async function getDecodeModule() {
	const module = await import("squoosh/codecs/webp/dec/webp_dec");
	return initEmscriptenModule<DecodeModule>(module.default, decodeWasmUrl);
}
