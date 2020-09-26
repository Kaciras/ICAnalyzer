// @ts-ignore
import metrics from "../build/metrics";

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

interface ButteraugliResult {
	source: number;
	heatMap: Uint8Array;
}

function checkImages(imageA: ImageData, imageB: ImageData) {
	const { width, height } = imageA;
	const lenA = imageA.data.byteLength;
	const lenB = imageB.data.byteLength;

	if (width !== imageB.width) {
		throw new Error(`Images have different width ${width} vs. ${imageB.width}`);
	}
	if (height !== imageB.height) {
		throw new Error(`Images have different height ${height} vs. ${imageB.height}`);
	}
	if (lenA !== lenB) {
		throw new Error(`Images have different length ${lenA} vs. ${lenB}`);
	}
}

export async function butteraugli(imageA: ImageData, imageB: ImageData, options?: Partial<ButteraugliOptions>) {
	const { width, height } = imageA;
	const merged = options = { ...DEFAULT_OPTIONS, ...options };

	if (merged.goodQualitySeek < 0 || merged.goodQualitySeek >= 2) {
		throw new Error("goodQualitySeek must between 0, 2");
	}
	if (merged.badQualitySeek < 0 || merged.badQualitySeek >= 2) {
		throw new Error("badQualitySeek must between 0, 2");
	}

	const wasmModule = await metrics();
	return wasmModule.getButteraugli(imageA.data, imageB.data, width, height, options) as ButteraugliResult;
}

export async function getPSNR(imageA: ImageData, imageB: ImageData) {
	const { width, height } = imageA;
	checkImages(imageA, imageB);

	const wasmModule = await metrics();
	return wasmModule.getPSNR(imageA.data, imageB.data, width, height) as number;
}

// export function getSSIM(imageA: ImageData, imageB: ImageData) {
//
// }
