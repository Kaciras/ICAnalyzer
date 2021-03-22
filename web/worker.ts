import * as Comlink from "comlink";
import * as Similarity from "../lib/similarity";
import { Butteraugli, ButteraugliOptions, SSIMOptions } from "../lib/similarity";
import wasmUrl from "../lib/diff.wasm";
import * as MozJPEGEncoder from "./codecs/mozjpeg/encoder";
import * as WebPEncoder from "./codecs/webp/encoder";
import * as WebPDecoder from "./codecs/webp/decoder";
import * as AVIFEncoder from "./codecs/avif/encoder";
import * as AVIFDecoder from "./codecs/avif/decoder";
import * as WebP2Encoder from "./codecs/webp2/encoder";
import * as WebP2Decoder from "./codecs/webp2/decoder";
import * as JXLEncoder from "./codecs/jxl/encoder";
import * as JXLDecoder from "./codecs/jxl/decoder";

let data: ImageData;
let butteraugli: Butteraugli;

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
		if (!butteraugli) {
			butteraugli = new Butteraugli(data);
		}
		return butteraugli.diff(image, options);
	},

	async mozjpegEncode(options: MozJPEGEncoder.EncodeOptions) {
		return timed(() => MozJPEGEncoder.encode(data, options));
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

	async jxlEncode(options: JXLEncoder.EncodeOptions) {
		return timed(() => JXLEncoder.encode(data, options));
	},

	async jxlDecode(data: ArrayBuffer) {
		return JXLDecoder.decode(data);
	},

	async webp2Encode(options: WebP2Encoder.EncodeOptions) {
		return timed(() => WebP2Encoder.encode(data, options));
	},

	async webp2Decode(data: ArrayBuffer) {
		return WebP2Decoder.decode(data);
	},
};

Comlink.expose(workerApi);

export type WorkerApi = typeof workerApi;
