import type { EncodeOptions } from "squoosh/codecs/webp/enc/webp_enc.js";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils/index.ts";
import { wasmEncodeFn } from "../common.ts";

export { defaultOptions } from "squoosh/src/features/encoders/webP/shared/meta";

export { EncodeOptions };

export const encode = wasmEncodeFn<EncodeOptions>(async () => {
	const webpEncoder = await import("squoosh/codecs/webp/enc/webp_enc_simd");
	return initEmscriptenModule(webpEncoder.default);
});
