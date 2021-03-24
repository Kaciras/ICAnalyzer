import type { EncodeOptions } from "squoosh/codecs/jxl/enc/jxl_enc";
import encodeWasmUrl from "squoosh/codecs/jxl/enc/jxl_enc.wasm";
import decodeWasmUrl from "squoosh/codecs/jxl/dec/jxl_dec.wasm";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import { wasmDecodeFn, wasmEncodeFn } from "../common";

export { EncodeOptions };

export const encode = wasmEncodeFn<EncodeOptions>(async () => {
	const module = await import("squoosh/codecs/jxl/enc/jxl_enc");
	return initEmscriptenModule(module.default, encodeWasmUrl);
});

export const decode = wasmDecodeFn(async () => {
	const module = await import("squoosh/codecs/jxl/dec/jxl_dec");
	return initEmscriptenModule(module.default, decodeWasmUrl);
});
