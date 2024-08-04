import { RPC } from "@kaciras/utilities/browser";
import * as icodec from "icodec";
import * as Similarity from "../../lib/similarity.ts";
import { Butteraugli, ButteraugliOptions, SSIMOptions } from "../../lib/similarity.ts";
import diffWASM from "../../lib/diff.wasm";
import { EncodeResult } from "../codecs/index.ts";

// A worker can only convert one image at the same time, so use global variable for more simplify code.
let data: ImageData;

let butteraugli: Butteraugli;

async function bindEncoder(this: icodec.ICodecEncoder, options: any) {
	await this.loadEncoder();

	const start = performance.now();
	const output = this.encode(data, options);
	const end = performance.now();

	const result: EncodeResult = {
		time: (end - start) / 1000,
		buffer: output.buffer,
	};
	return RPC.transfer(result, [result.buffer]);
}

async function bindDecoder(this: icodec.ICodecDecoder, buffer: BufferSource) {
	await this.loadDecoder();
	const output = this.decode(buffer);
	return RPC.transfer(output, [output.data.buffer]);
}

const publicApis = {

	setOriginal(image: ImageData) {
		data = image;
	},

	qoiEncode: bindEncoder.bind(icodec.qoi as any),
	mozjpegEncode: bindEncoder.bind(icodec.jpeg),
	jxlEncode: bindEncoder.bind(icodec.jxl),
	webpEncode: bindEncoder.bind(icodec.webp),
	avifEncode: bindEncoder.bind(icodec.avif),
	webp2Encode: bindEncoder.bind(icodec.wp2),

	jxlDecode: bindDecoder.bind(icodec.jxl),
	avifDecode: bindDecoder.bind(icodec.avif),
	webp2Decode: bindDecoder.bind(icodec.wp2),
	qoiDecode: bindDecoder.bind(icodec.qoi),

	async calcSSIM(image: ImageData, options?: SSIMOptions) {
		await Similarity.initWasmModule(diffWASM);
		return Similarity.getSSIM(data, image, options);
	},

	async calcPSNR(image: ImageData) {
		await Similarity.initWasmModule(diffWASM);
		return Similarity.getPSNR(data, image);
	},

	async calcButteraugli(image: ImageData, options?: ButteraugliOptions) {
		await Similarity.initWasmModule(diffWASM);
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
