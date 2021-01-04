import * as Comlink from "comlink";
import * as Similarity from "../lib/similarity";
import { ButteraugliOptions, SSIMOptions } from "../lib/similarity";
import wasmUrl from "../lib/metrics.wasm";
import * as WebPEncoder from "./codecs/webp/encoder";
import * as WebPDecoder from "./codecs/webp/decoder";
import * as AVIFEncoder from "./codecs/avif/encoder";
import * as AVIFDecoder from "./codecs/avif/decoder";

let data: ImageData;

async function timed(func: () => Promise<ArrayBuffer>) {
	const start = performance.now();
	const buffer = await func();
	const end = performance.now();
	return { buffer, time: end - start };
}

const workerApi = {

	setImageToEncode(image: ImageData) {
		data = image;
	},

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
		return Similarity.butteraugli(data, image, options);
	},

	async webpEncode(options: WebPEncoder.EncodeOptions) {
		return timed(() => WebPEncoder.encode(data, options));
	},

	async webpDecode(data: ArrayBuffer) {
		return WebPDecoder.decode(data);
	},

	async avifEncode(options: AVIFEncoder.EncodeOptions) {
		return timed(() => AVIFEncoder.encode(data, options));
	},

	async avifDecode(data: ArrayBuffer): Promise<ImageData> {
		return AVIFDecoder.decode(data);
	},
};

Comlink.expose(workerApi);

export type WorkerApi = typeof workerApi;
