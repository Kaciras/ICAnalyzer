import * as Comlink from "comlink";
import webp_enc, { WebPEncodeOptions, WebPModule } from "./webp_enc";
import { initEmscriptenModule } from "./utils";
import wasmUrl from "./webp_enc.wasm";

const DEFAULT: WebPEncodeOptions = {
	quality: 75,
	target_size: 0,
	target_PSNR: 0,
	method: 4,
	sns_strength: 50,
	filter_strength: 60,
	filter_sharpness: 0,
	filter_type: 1,
	partitions: 0,
	segments: 4,
	pass: 1,
	show_compressed: 0,
	preprocessing: 0,
	autofilter: 0,
	partition_limit: 0,
	alpha_compression: 1,
	alpha_filtering: 1,
	alpha_quality: 100,
	lossless: 0,
	exact: 0,
	image_hint: 0,
	emulate_jpeg_size: 0,
	thread_level: 0,
	low_memory: 0,
	near_lossless: 100,
	use_delta_palette: 0,
	use_sharp_yuv: 0,
};

let webpModule: WebPModule;
let imageToEncode: ImageData;

async function initialize(image: ImageData) {
	imageToEncode = image;
	webpModule = await initEmscriptenModule(webp_enc, wasmUrl);
}

function encode(options: WebPEncodeOptions) {
	const { data, width, height } = imageToEncode;
	options = { ...DEFAULT, ...options };

	const result = webpModule.encode(data, width, height, options);
	if (!result) {
		throw new Error("Encoding error.");
	}
	return result;
}

export interface WebpWorker {
	initialize: typeof initialize;
	encode: typeof encode;
}

Comlink.expose({ initialize, encode });
