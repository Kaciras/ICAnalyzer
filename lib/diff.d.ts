export interface FullButteraugliOptions {
	hfAsymmetry: number;
	goodQualitySeek: number;
	badQualitySeek: number;
}

// [score, heatMap]
export type ButteraugliTuple = [number, Uint8Array];

export interface ButteraugliDiff {
	delete(): void;
	Diff(data: ArrayBuffer, options: FullButteraugliOptions): ButteraugliTuple;
}

interface ButteraugliDiffConstructor {
	prototype: ButteraugliDiff;
	new(image: ImageData): ButteraugliDiff;
}

export interface MetricsModule extends EmscriptenModule {

	GetMSE(imageA: ArrayBuffer, imageB: ArrayBuffer): number;

	ButteraugliDiff: ButteraugliDiffConstructor;
}

export default function (overrides?: Partial<EmscriptenModule>): Promise<MetricsModule>;
