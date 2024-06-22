import { ImageWorker } from "../../features/image-worker.ts";
import { OptionType } from "../../form/index.ts";
import { defaultOptions, EncodeOptions } from "./codec.ts";

export const name = "QOI";
export const mimeType = "image/qoi";
export const extension = "qoi";

export { defaultOptions };

export const templates: OptionType[] = [];

export function encode(options: EncodeOptions, worker: ImageWorker) {
	return worker.qoiEncode(options);
}
