import * as Comlink from "comlink";
import webp_enc, { WebPModule } from "./webp_enc";
import { EncodeWorker, initEmscriptenModule } from "./utils";
import wasmUrl from "./webp_enc.wasm";

export enum WebPImageHint {
	WEBP_HINT_DEFAULT, // default preset.
	WEBP_HINT_PICTURE, // digital picture, like portrait, inner shot
	WEBP_HINT_PHOTO,   // outdoor photograph, with natural lighting
	WEBP_HINT_GRAPH,   // Discrete tone image (graph, map-tile etc).
}

const DEFAULT = {
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
	image_hint: WebPImageHint.WEBP_HINT_DEFAULT,
	emulate_jpeg_size: 0,
	thread_level: 0,
	low_memory: 0,
	near_lossless: 100,
	use_delta_palette: 0,
	use_sharp_yuv: 0,
};

export type WebPEncodeOptions = Partial<typeof DEFAULT>;

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

export type WebPWorker = EncodeWorker<WebPEncodeOptions>;

Comlink.expose({ initialize, encode } as WebPWorker);
