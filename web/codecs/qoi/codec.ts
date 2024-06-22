import type { EncodeOptions } from "squoosh/codecs/qoi/enc/qoi_enc.js";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils/index.ts";
import { wasmDecodeFn, wasmEncodeFn } from "../common.ts";

export { EncodeOptions };

export const defaultOptions: EncodeOptions = {};

export const encode = wasmEncodeFn<EncodeOptions>(async () => {
	const module = await import("squoosh/codecs/qoi/enc/qoi_enc.js");
	return initEmscriptenModule(module.default);
});

export const decode = wasmDecodeFn(async () => {
	const module = await import("squoosh/codecs/qoi/dec/qoi_dec.js");
	return initEmscriptenModule(module.default);
});
