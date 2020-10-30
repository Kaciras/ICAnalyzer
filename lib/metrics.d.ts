export interface TwoImages {
	dataA: Uint8Array;
	dataB: Uint8Array;
	width: number;
	height: number;
}

export interface FullButteraugliOptions {
	hfAsymmetry: number;
	goodQualitySeek: number;
	badQualitySeek: number;
	ensureAlpha: boolean;
}

export type ButteraugliResult = [number, ArrayBuffer];

export interface MetricsModule {

	GetMSE(twoImages: TwoImages): number;

	GetButteraugli(twoImages: TwoImages, options: FullButteraugliOptions): ButteraugliResult;
}

export default function (overrides?: Partial<EmscriptenModule>): Promise<MetricsModule>;
