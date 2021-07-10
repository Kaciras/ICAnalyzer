import type { EncodeOptions } from "squoosh/codecs/mozjpeg/enc/mozjpeg_enc";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import { wasmEncodeFn } from "../common";

export { EncodeOptions };

export const encode = wasmEncodeFn<EncodeOptions>(async () => {
	const module = await import("squoosh/codecs/mozjpeg/enc/mozjpeg_enc");
	return initEmscriptenModule(module.default);
});
