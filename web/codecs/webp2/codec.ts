import type { EncodeOptions } from "squoosh/codecs/wp2/enc/wp2_enc";
import encodeWasmUrl from "squoosh/codecs/wp2/enc/wp2_enc.wasm";
import decodeWasmUrl from "squoosh/codecs/wp2/dec/wp2_dec.wasm";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import { wasmDecodeFn, wasmEncodeFn } from "../common";

export { EncodeOptions };

export const encode = wasmEncodeFn<EncodeOptions>(async () => {
	const module = await import("squoosh/codecs/wp2/enc/wp2_enc");
	return initEmscriptenModule(module.default, encodeWasmUrl);
});

export const decode = wasmDecodeFn(async () => {
	const module = await import("squoosh/codecs/wp2/dec/wp2_dec");
	return initEmscriptenModule(module.default, decodeWasmUrl);
});
