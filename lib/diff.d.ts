export interface FullButteraugliOptions {
	hfAsymmetry: number;
	goodQualitySeek: number;
	badQualitySeek: number;
}

export type ButteraugliResult = [number, Uint8Array];

export interface ButteraugliDiff {
	delete(): void;
	Diff(data: ArrayBuffer, options: FullButteraugliOptions): ButteraugliResult;
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
