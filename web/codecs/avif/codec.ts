import type { EncodeOptions } from "squoosh/codecs/avif/enc/avif_enc";
import encodeWasmUrl from "squoosh/codecs/avif/enc/avif_enc.wasm";
import decodeWasmUrl from "squoosh/codecs/avif/dec/avif_dec.wasm";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import { wasmDecodeFn, wasmEncodeFn } from "../common";

export { EncodeOptions };

export const encode = wasmEncodeFn<EncodeOptions>(async () => {
	const module = await import("squoosh/codecs/avif/enc/avif_enc");
	return initEmscriptenModule(module.default, encodeWasmUrl);
});

export const decode = wasmDecodeFn(async () => {
	const module = await import("squoosh/codecs/avif/dec/avif_dec");
	return initEmscriptenModule(module.default, decodeWasmUrl);
});
