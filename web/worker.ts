import * as Comlink from "comlink";
import * as Similarity from "../lib/similarity";
import { Butteraugli, ButteraugliOptions, SSIMOptions } from "../lib/similarity";
import wasmUrl from "../lib/diff.wasm";
import { createDecodeFn, createEncodeFn, EncodeModule } from "./codecs/common";
import * as MozJPEG from "./codecs/mozjpeg/codec";
import * as JXL from "./codecs/jxl/codec";
import * as WebP from "./codecs/webp/codec";
import * as AVIF from "./codecs/avif/codec";
import * as WebP2 from "./codecs/webp2/codec";

// A worker can only convert one image at the same time, so use global variable for more simplify code.
let data: ImageData;
let butteraugli: Butteraugli;

function bindEncoder<T>(loader: EncodeModule<T>) {
	const encodeFn = createEncodeFn(loader);

	return async (options: T) => {
		const start = performance.now();
		const buffer = await encodeFn(data, options);
		const end = performance.now();
		return { buffer, time: end - start };
	};
}

const workerApi = {

	setImageToEncode(image: ImageData) {
		data = image;
	},

	mozjpegEncode: bindEncoder(MozJPEG),
	jxlEncode: bindEncoder(JXL),
	webpEncode: bindEncoder(WebP),
	avifEncode: bindEncoder(AVIF),
	webp2Encode: bindEncoder(WebP2),

	jxlDecode: createDecodeFn(JXL),
	webpDecode: createDecodeFn(WebP),
	avifDecode: createDecodeFn(AVIF),
	webp2Decode: createDecodeFn(WebP2),

	async calcSSIM(image: ImageData, options?: SSIMOptions) {
		await Similarity.initWasmModule(wasmUrl);
		return Similarity.getSSIM(data, image, options);
	},

	async calcPSNR(image: ImageData) {
		await Similarity.initWasmModule(wasmUrl);
		return Similarity.getPSNR(data, image);
	},

	async calcButteraugli(image: ImageData, options?: ButteraugliOptions) {
		await Similarity.initWasmModule(wasmUrl);
		if (!butteraugli) {
			butteraugli = new Butteraugli(data);
		}
		return butteraugli.diff(image, options);
	},
};

Comlink.expose(workerApi);

export type WorkerApi = typeof workerApi;
