import metrics, { FullButteraugliOptions, MetricsModule } from "./metrics";
import ssim, { Options } from "ssim.js";

export type ButteraugliOptions = Partial<FullButteraugliOptions>;

export type SSIMOptions = Partial<Options>;

export const defaultButteraugliOptions: FullButteraugliOptions = {
	hfAsymmetry: 1.0,
	goodQualitySeek: 1.5,
	badQualitySeek: 0.5,
	ensureAlpha: false,
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

function checkImages(image0: ImageData, image1: ImageData) {
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

function toWasmType(image0: ImageData, image1: ImageData) {
	return {
		dataA: image0.data,
		dataB: image1.data,
		width: image0.width,
		height: image0.height,
	};
}

export function butteraugli(image0: ImageData, image1: ImageData, options?: ButteraugliOptions) {
	if (!loadPromise) {
		throw new Error("Wasm module not load");
	}
	checkImages(image0, image1);

	const merged = { ...defaultButteraugliOptions, ...options };

	if (merged.badQualitySeek < 0 || merged.badQualitySeek >= 2) {
		throw new Error("badQualitySeek must between 0, 2");
	}
	if (merged.goodQualitySeek < 0 || merged.goodQualitySeek >= 2) {
		throw new Error("goodQualitySeek must between 0, 2");
	}
	return wasmModule.GetButteraugli(toWasmType(image0, image1), merged);
}

export function getPSNR(image0: ImageData, image1: ImageData) {
	if (!wasmModule) {
		throw new Error("Wasm module not loaded");
	}
	checkImages(image0, image1);
	const mse = wasmModule.GetMSE(toWasmType(image0, image1));
	return 10 * Math.log10(255 * 255 / mse);
}

export function getSSIM(image0: ImageData, image1: ImageData, options?: SSIMOptions) {
	return ssim(image0, image1, options).mssim;
}
