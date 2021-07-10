import type { EncodeOptions } from "squoosh/codecs/wp2/enc/wp2_enc";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import { wasmDecodeFn, wasmEncodeFn } from "../common";

export { EncodeOptions };

export const encode = wasmEncodeFn<EncodeOptions>(async () => {
	const module = await import("squoosh/codecs/wp2/enc/wp2_enc");
	return initEmscriptenModule(module.default);
});

export const decode = wasmDecodeFn(async () => {
	const module = await import("squoosh/codecs/wp2/dec/wp2_dec");
	return initEmscriptenModule(module.default);
});
