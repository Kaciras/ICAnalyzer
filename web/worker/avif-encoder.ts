import * as Comlink from "comlink";
import * as AVifEncoder from "../../deps/squoosh/src/codecs/avif/encoder";
import { EncodeOptions } from "../../deps/squoosh/src/codecs/avif/encoder-meta";
import { EncodeWorker } from "./utils";

export enum Subsample {
	YUV400 = 0,
	YUV420 = 1,
	YUV422 = 2,
	YUV444 = 3,
}

export interface Options extends Omit<EncodeOptions, "subsample"> {
	subsample: Subsample;
}

let imageToEncode: ImageData;

Comlink.expose({
	initialize(image: ImageData) {
		imageToEncode = image;
	},
	encode(options: Options) {
		return AVifEncoder.encode(imageToEncode, options);
	},
} as EncodeWorker<Options>);
