import { ImageWorker } from "../features/image-worker.ts";
import { OptionType } from "../form/index.ts";

export const name = "QOI";
export const mimeType = "image/qoi";
export const extension = "qoi";

export const defaultOptions = {};

export const templates: OptionType[] = [];

export function encode(options: never, worker: ImageWorker) {
	return worker.qoiEncode(options);
}
