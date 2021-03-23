import type { EncodeOptions } from "squoosh/codecs/mozjpeg/enc/mozjpeg_enc";
import encodeWasmUrl from "squoosh/codecs/mozjpeg/enc/mozjpeg_enc.wasm";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import type { Encoder } from "../common";

export { EncodeOptions };

export async function getEncoder() {
	const module = await import("squoosh/codecs/mozjpeg/enc/mozjpeg_enc");
	return initEmscriptenModule<Encoder<EncodeOptions>>(module.default, encodeWasmUrl);
}
