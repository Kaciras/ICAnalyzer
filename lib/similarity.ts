import metrics, { ButteraugliDiff, ButteraugliOptions, MetricsModule } from "./diff";
import ssim, { Options } from "ssim.js";

export type SSIMOptions = Partial<Options>;
export type { ButteraugliOptions };

export const defaultButteraugliOptions: ButteraugliOptions = {
	hfAsymmetry: 1.0,
	goodQualitySeek: 1.5,
	badQualitySeek: 0.5,
};

let loadPromise: Promise<void> | undefined;

let wasmModule: MetricsModule;

/**
 * Initialize WebAssembly module, you must call this function before butteraugli()
 *
 * @param wasmUrl Url of metrics.wasm, If omitted, use the file in the same directory.
 */
export function initWasmModule(wasmUrl?: string) {
	if (loadPromise) {
		return loadPromise;
	}
	const init = wasmUrl ? metrics({ locateFile: () => wasmUrl }) : metrics();
	return loadPromise = init.then(m => { wasmModule = m; });
}

function check(image0: ImageData, image1: ImageData) {
	const len0 = image0.data.byteLength;
	const len1 = image1.data.byteLength;

	if (len0 !== len1) {
		throw new Error(`Image data have different length ${len0} vs. ${len1}`);
	}

	const channels = len0 / image0.width / image0.height;
	if (channels !== 3 && channels !== 4) {
		throw new Error("Image must be RGB or RGBA in colors");
	}

	if (image0.width !== image1.width) {
		throw new Error(`Image have different width ${image0.width} vs. ${image1.width}`);
	}
	if (image0.height !== image1.height) {
		throw new Error(`Image have different width ${image0.height} vs. ${image1.height}`);
	}
}

export class Butteraugli {

	private readonly native: ButteraugliDiff;
	private readonly reference: ImageData;

	constructor(image: ImageData) {
		this.reference = image;
		this.native = new wasmModule.ButteraugliDiff(image);
	}

	close() {
		this.native.delete();
	}

	diff(image: ImageData, options?: Partial<ButteraugliOptions>) {
		if (!loadPromise) {
			throw new Error("Wasm module not load");
		}
		check(this.reference, image);

		const merged = { ...defaultButteraugliOptions, ...options };

		if (merged.badQualitySeek < 0 || merged.badQualitySeek >= 2) {
			throw new Error("badQualitySeek must between 0, 2");
		}
		if (merged.goodQualitySeek < 0 || merged.goodQualitySeek >= 2) {
			throw new Error("goodQualitySeek must between 0, 2");
		}

		return this.native.Diff(image.data, merged);
	}
}

export function getPSNR(image0: ImageData, image1: ImageData) {
	if (!wasmModule) {
		throw new Error("Wasm module not loaded");
	}
	check(image0, image1);

	const dataA = image0.data;
	const dataB = image1.data;
	const { length } = dataA;

	let sse = 0;
	for (let i = 0; i < length; i++) {
		const e = dataA[i] - dataB[i];
		sse += e * e;
	}
	return 10 * Math.log10(255 * 255 / sse * length);
}

export function getSSIM(image0: ImageData, image1: ImageData, options?: SSIMOptions) {
	return ssim(image0, image1, options).mssim;
}
