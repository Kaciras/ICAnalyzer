import { simd } from "wasm-feature-detect";
import type { EncodeOptions } from "squoosh/codecs/webp/enc/webp_enc";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import { wasmDecodeFn, wasmEncodeFn } from "../common";

export { EncodeOptions };

export const encode = wasmEncodeFn<EncodeOptions>(async () => {
	if (await simd()) {
		const webpEncoder = await import("squoosh/codecs/webp/enc/webp_enc_simd");
		return initEmscriptenModule(webpEncoder.default);
	}
	const webpEncoder = await import("squoosh/codecs/webp/enc/webp_enc");
	return initEmscriptenModule(webpEncoder.default);
});

export const decode = wasmDecodeFn(async () => {
	const module = await import("squoosh/codecs/webp/dec/webp_dec");
	return initEmscriptenModule(module.default);
});
