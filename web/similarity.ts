// @ts-ignore
import metrics from "../build/metrics";

export interface ButteraugliOptions {
	hfAsymmetry?: number;
	goodQualitySeek?: number;
	badQualitySeek?: number;
}

const DEFAULT_OPTIONS: ButteraugliOptions = {
	hfAsymmetry: 1.0,
	goodQualitySeek: 1.5,
	badQualitySeek: 0.5,
};

type ButteraugliResult = [number, Uint8Array];

export async function butteraugli(imageA: ImageData, imageB: ImageData, options?: ButteraugliOptions) {
	const { width, height } = imageA;
	options = { ...DEFAULT_OPTIONS, ...options };

	const wasmModule = await metrics();
	return wasmModule.getButteraugli(imageA.data, imageB.data, width, height, options) as ButteraugliResult;
}

// export function getPSNR(imageA: ImageData, imageB: ImageData) {
//
// }
//
// export function getSSIM(imageA: ImageData, imageB: ImageData) {
//
// }
