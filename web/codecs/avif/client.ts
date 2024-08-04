import { avif } from "icodec";
import { ImageWorker } from "../../features/image-worker";
import { BoolOption, EnumOption, NumberOption, OptionType } from "../../form/index.ts";

export const name = "AVIF";
export const mimeType = avif.mimeType;
export const extension = avif.extension;

export const defaultOptions = avif.defaultOptions;

export const templates: OptionType[] = [
	new NumberOption({
		id: "quality",
		label: "Quality (100 + YUV444 = lossless)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.quality,
	}),
	new NumberOption({
		id: "qualityAlpha",
		label: "Alpha quality (-1 to same with the quality)",
		min: -1,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.qualityAlpha,
	}),
	new EnumOption({
		id: "subsample",
		label: "Subsample",
		enumObject: avif.Subsampling,
		defaultValue: "YUV420",
	}),
	new BoolOption({
		id: "chromaDeltaQ",
		label: "Extra chroma compression",
		defaultValue: defaultOptions.chromaDeltaQ,
	}),
	new NumberOption({
		id: "sharpness",
		label: "Sharpness",
		min: 0,
		max: 7,
		step: 1,
		defaultValue: defaultOptions.sharpness,
	}),
	new NumberOption({
		id: "denoiseLevel",
		label: "Noise synthesis",
		min: 0,
		max: 50,
		step: 1,
		defaultValue: defaultOptions.denoiseLevel,
	}),
	new EnumOption({
		id: "tune",
		label: "Tuning",
		enumObject: avif.AVIFTune,
		defaultValue: "Auto",
	}),
	new NumberOption({
		id: "tileRowsLog2",
		label: "Log2 of tile rows",
		min: 0,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.tileRowsLog2,
	}),
	new NumberOption({
		id: "tileColsLog2",
		label: "Log2 of tile cols",
		min: 0,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.tileColsLog2,
	}),
	new NumberOption({
		id: "speed",
		label: "Speed",
		min: 0,
		max: 10,
		step: 1,
		defaultValue: defaultOptions.speed,
	}),
	new BoolOption({
		id: "enableSharpYUV",
		label: "Sharp YUV Downsampling",
		defaultValue: defaultOptions.enableSharpYUV,
	}),
];

export function encode(options: avif.Options, worker: ImageWorker) {
	options.tune = avif.AVIFTune[options.tune];
	options.subsample = avif.Subsampling[options.subsample];
	return worker.avifEncode(options);
}
