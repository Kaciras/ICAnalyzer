export interface TwoImages {
	dataA: ArrayBufferView;
	dataB: ArrayBufferView;
	width: number;
	height: number;
}

export interface FullButteraugliOptions {
	hfAsymmetry: number;
	goodQualitySeek: number;
	badQualitySeek: number;
}

export type ButteraugliResult = [number, ArrayBuffer];

export interface MetricsModule extends EmscriptenModule {

	GetMSE(twoImages: TwoImages): number;

	GetButteraugli(twoImages: TwoImages, options: FullButteraugliOptions): ButteraugliResult;
}

export default function (overrides?: Partial<EmscriptenModule>): Promise<MetricsModule>;
