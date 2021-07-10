import type { EncodeOptions } from "squoosh/codecs/jxl/enc/jxl_enc";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import { wasmDecodeFn, wasmEncodeFn } from "../common";

export { EncodeOptions };

export const encode = wasmEncodeFn<EncodeOptions>(async () => {
	const module = await import("squoosh/codecs/jxl/enc/jxl_enc");
	return initEmscriptenModule(module.default);
});

export const decode = wasmDecodeFn(async () => {
	const module = await import("squoosh/codecs/jxl/dec/jxl_dec");
	return initEmscriptenModule(module.default);
});
