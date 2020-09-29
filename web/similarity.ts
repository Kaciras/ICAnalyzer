// @ts-ignore
import metrics from "../build/metrics";

export interface TwoImages {
	dataA: Uint8Array;
	dataB: Uint8Array;
	width: number;
	height: number;
}

export interface ButteraugliOptions {
	hfAsymmetry: number;
	goodQualitySeek: number;
	badQualitySeek: number;
}

const DEFAULT_OPTIONS: ButteraugliOptions = {
	hfAsymmetry: 1.0,
	goodQualitySeek: 1.5,
	badQualitySeek: 0.5,
};

type ButteraugliResult = [number, ArrayBuffer];

export async function butteraugli(twoImages: TwoImages, options?: Partial<ButteraugliOptions>) {
	const { dataA, dataB, width, height } = twoImages;

	if (dataA.byteLength !== dataB.byteLength) {
		throw new Error(`Image buffers have different length ${dataA.byteLength} vs. ${dataB.byteLength}`);
	}

	const merged = {
		...DEFAULT_OPTIONS,
		...options,
	};
	if (merged.goodQualitySeek < 0 || merged.goodQualitySeek >= 2) {
		throw new Error("goodQualitySeek must between 0, 2");
	}
	if (merged.badQualitySeek < 0 || merged.badQualitySeek >= 2) {
		throw new Error("badQualitySeek must between 0, 2");
	}

	const wasmModule = await metrics();
	return wasmModule.GetButteraugli(dataA, dataB, width, height, merged) as ButteraugliResult;
}

export async function getPSNR(twoImages: TwoImages) {
	const { dataA, dataB, width, height } = twoImages;

	const wasmModule = await metrics();
	const mse = wasmModule.GetMSE(dataA, dataB, width, height) as number;
	return 10 * Math.log10(255 * 255 / mse);
}

// export function getSSIM(imageA: ImageData, imageB: ImageData) {
//
// }
