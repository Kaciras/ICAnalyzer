import metrics, { ButteraugliOptions, MetricsModule, TwoImages } from "../out/metrics";
import ssim from "ssim.js";

const DEFAULT_OPTIONS: ButteraugliOptions = {
	hfAsymmetry: 1.0,
	goodQualitySeek: 1.5,
	badQualitySeek: 0.5,
};

let wasmModule: MetricsModule | undefined;

export async function initWasmModule(wasmUrl?: string) {
	if (wasmModule) {
		return;
	}
	wasmModule = wasmUrl
		? await metrics({ locateFile: () => wasmUrl })
		: await metrics();
}

function checkImages(twoImages: TwoImages) {
	const { dataA, dataB, width, height } = twoImages;
	const channels = dataA.byteLength / width / height;

	if (channels !== 3 && channels !== 4) {
		throw new Error("Image must be RGB or RGBA in colors");
	}
	if (dataA.byteLength !== dataB.byteLength) {
		throw new Error(`Image data have different length ${dataA.byteLength} vs. ${dataB.byteLength}`);
	}
}

export function butteraugli(twoImages: TwoImages, options?: Partial<ButteraugliOptions>) {
	if (!wasmModule) {
		throw new Error("Wasm module not loaded");
	}

	const merged = { ...DEFAULT_OPTIONS, ...options };

	if (merged.badQualitySeek < 0 || merged.badQualitySeek >= 2) {
		throw new Error("badQualitySeek must between 0, 2");
	}
	if (merged.goodQualitySeek < 0 || merged.goodQualitySeek >= 2) {
		throw new Error("goodQualitySeek must between 0, 2");
	}

	checkImages(twoImages);
	return wasmModule.GetButteraugli(twoImages, merged);
}

export function getPSNR(twoImages: TwoImages) {
	if (!wasmModule) {
		throw new Error("Wasm module not loaded");
	}
	checkImages(twoImages);
	const mse = wasmModule.GetMSE(twoImages);
	return 10 * Math.log10(255 * 255 / mse);
}

export function getSSIM(twoImages: TwoImages) {
	const { width, height } = twoImages;
	const a = { data: new Uint8ClampedArray(twoImages.dataA), width, height };
	const b = { data: new Uint8ClampedArray(twoImages.dataB), width, height };
	return ssim(a, b).mssim;
}
