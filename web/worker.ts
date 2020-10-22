import * as Comlink from "comlink";
import type * as WebP from "squoosh/src/codecs/webp/encoder-meta";
import type * as AVIF from "squoosh/src/codecs/avif/encoder-meta";
import * as Similarity from "../lib/similarity";
import wasmUrl from "../lib/metrics.wasm";

let data: ImageData;

const workerApi = {

	setImageToEncode(image: ImageData) {
		data = image;
	},

	async calcPSNR(image: ImageData) {
		await Similarity.initWasmModule(wasmUrl);
		return Similarity.getPSNR({
			width: data.width,
			height: data.height,
			dataA: new Uint8Array(data.data),
			dataB: new Uint8Array(image.data),
		});
	},

	async calcSSIM(image: ImageData) {
		await Similarity.initWasmModule(wasmUrl);
		return Similarity.getPSNR({
			width: data.width,
			height: data.height,
			dataA: new Uint8Array(data.data),
			dataB: new Uint8Array(image.data),
		});
	},

	async calcButteraugli(image: ImageData){
		await Similarity.initWasmModule(wasmUrl);
		return Similarity.butteraugli({
			width: data.width,
			height: data.height,
			dataA: new Uint8Array(data.data),
			dataB: new Uint8Array(image.data),
		});
	},

	async webpEncode(options: WebP.EncodeOptions) {
		return (await import("squoosh/src/codecs/webp/encoder")).encode(data, options);
	},

	async webpDecode(data: ArrayBuffer) {
		return (await import("squoosh/src/codecs/webp/decoder")).decode(data);
	},

	async avifEncode(options: AVIF.EncodeOptions) {
		return (await import("squoosh/src/codecs/avif/encoder")).encode(data, options);
	},

	async avifDecode(data: ArrayBuffer): Promise<ImageData> {
		return (await import("squoosh/src/codecs/avif/decoder")).decode(data);
	},
};

Comlink.expose(workerApi);

export type WorkerApi = typeof workerApi;
