import { RPC } from "@kaciras/utilities/browser";
import * as Similarity from "../../lib/similarity.ts";
import { Butteraugli, ButteraugliOptions, SSIMOptions } from "../../lib/similarity.ts";
import wasmUrl from "../../lib/diff.wasm";
import { EncodeResult } from "../codecs/common.ts";
import * as MozJPEG from "../codecs/mozjpeg/codec.ts";
import * as JXL from "../codecs/jxl/codec.ts";
import * as WebP from "../codecs/webp/codec.ts";
import * as AVIF from "../codecs/avif/codec.ts";
import * as WebP2 from "../codecs/webp2/codec.ts";
import * as QOI from "../codecs/qoi/codec.ts";

// A worker can only convert one image at the same time, so use global variable for more simplify code.
let data: ImageData;

let butteraugli: Butteraugli;

interface CodecModule<T> {
	encode(image: ImageData, options: T): Promise<EncodeResult>;
}

function bindEncoder<T>(module: CodecModule<T>) {
	return (options: T) => module.encode(data, options);
}

const publicApis = {

	setOriginal(image: ImageData) {
		data = image;
	},

	mozjpegEncode: bindEncoder(MozJPEG),
	jxlEncode: bindEncoder(JXL),
	webpEncode: bindEncoder(WebP),
	avifEncode: bindEncoder(AVIF),
	webp2Encode: bindEncoder(WebP2),
	qoiEncode: bindEncoder(QOI),

	jxlDecode: JXL.decode,
	avifDecode: AVIF.decode,
	webp2Decode: WebP2.decode,
	qoiDecode: QOI.decode,

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
		butteraugli ??= new Butteraugli(data);

		const [score, heatMap] = butteraugli.diff(image, options);
		return {
			score,
			heatMap: RPC.transfer(heatMap, [heatMap.buffer]),
		};
	},
};

RPC.probeServer(publicApis, self);

export type ImageWorkerApi = typeof publicApis;
