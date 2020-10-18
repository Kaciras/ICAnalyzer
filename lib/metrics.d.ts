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

export type ButteraugliResult = [number, ArrayBuffer];

export interface MetricsModule {

	GetMSE(twoImages: TwoImages): number;

	GetButteraugli(twoImages: TwoImages, options: ButteraugliOptions): ButteraugliResult;
}

export default function (overrides?: Partial<EmscriptenModule>): Promise<MetricsModule>;
