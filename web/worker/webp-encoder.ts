import * as Comlink from "comlink";
import * as WebPEncoder from "../../deps/squoosh/src/codecs/webp/encoder";
import { EncodeOptions, defaultOptions, WebPImageHint } from "../../deps/squoosh/src/codecs/webp/encoder-meta";
import { EncodeWorker } from "./utils";

let imageToEncode: ImageData;

Comlink.expose({
	initialize(image: ImageData) {
		imageToEncode = image;
	},
	encode(options: Options) {
		options = { ...defaultOptions, ...options };
		return WebPEncoder.encode(imageToEncode, options);
	},
} as EncodeWorker<Options>);
