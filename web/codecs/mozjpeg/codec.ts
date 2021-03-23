import type { EncodeOptions } from "squoosh/codecs/mozjpeg/enc/mozjpeg_enc";
import encodeWasmUrl from "squoosh/codecs/mozjpeg/enc/mozjpeg_enc.wasm";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import type { EncodeModule } from "../common";

export { EncodeOptions };

export async function getEncodeModule() {
	const module = await import("squoosh/codecs/mozjpeg/enc/mozjpeg_enc");
	return initEmscriptenModule<EncodeModule<EncodeOptions>>(module.default, encodeWasmUrl);
}
