import { jxl } from "icodec";
import { ImageWorker } from "../features/image-worker.ts";
import { BoolOption, EnumOption, NumberOption, OptionType } from "../form/index.ts";

export const name = "JPEG XL";
export const mimeType = jxl.mimeType;
export const extension = jxl.extension;

export const defaultOptions = jxl.defaultOptions;

export const templates: OptionType[] = [
	new BoolOption({
		id: "lossless",
		label: "Lossless",
		defaultValue: defaultOptions.lossless,
	}),
	new NumberOption({
		id: "quality",
		label: "Quality",
		min: 0,
		max: 100,
		step: 0.1,
		defaultValue: defaultOptions.quality,
	}),
	new NumberOption({
		id: "alphaQuality",
		label: "Alpha Quality",
		min: 0,
		max: 100,
		step: 0.1,
		defaultValue: defaultOptions.alphaQuality,
	}),
	new NumberOption({
		id: "effort",
		label: "Effort",
		min: 1,
		max: 9,
		step: 1,
		defaultValue: defaultOptions.effort,
	}),
	new NumberOption({
		id: "brotliEffort",
		label: "Brotli Effort",
		min: -1,
		max: 11,
		step: 1,
		defaultValue: defaultOptions.brotliEffort,
	}),
	new NumberOption({
		id: "epf",
		label: "Edge preserving filter (-1 = auto)",
		min: -1,
		max: 3,
		step: 1,
		defaultValue: defaultOptions.epf,
	}),
	new EnumOption({
		id: "gaborish",
		label: "Use gaborish Filter",
		enumObject: jxl.Override,
		defaultValue: "Default",
	}),
	new NumberOption({
		id: "decodingSpeed",
		label: "Optimise for decoding speed",
		min: 0,
		max: 4,
		step: 1,
		defaultValue: defaultOptions.decodingSpeed,
	}),
	new NumberOption({
		id: "photonNoiseIso",
		label: "Noise equivalent to ISO",
		min: 0,
		max: 50000,
		step: 100,
		defaultValue: defaultOptions.photonNoiseIso,
	}),
	new EnumOption({
		id: "responsive",
		label: "Responsive",
		enumObject: jxl.Override,
		defaultValue: "Default",
	}),
	new EnumOption({
		id: "progressiveAC",
		label: "Progressive AC",
		enumObject: jxl.Override,
		defaultValue: "Default",
	}),
	new NumberOption({
		id: "progressiveDC",
		label: "Progressive DC",
		min: -1,
		max: 2,
		step: 1,
		defaultValue: defaultOptions.progressiveDC,
	}),
	new EnumOption({
		id: "qProgressiveAC",
		label: "Q-Progressive AC",
		enumObject: jxl.Override,
		defaultValue: "Default",
	}),
	new BoolOption({
		id: "modular",
		label: "Modular",
		defaultValue: defaultOptions.modular,
	}),
	new BoolOption({
		id: "lossyPalette",
		label: "Slight loss",
		defaultValue: defaultOptions.lossyPalette,
	}),
	new NumberOption({
		id: "paletteColors",
		label: "Palette Colors",
		min: -1,
		max: 1048576,
		step: 1,
		defaultValue: defaultOptions.paletteColors,
	}),
	new NumberOption({
		id: "iterations",
		label: "MA-Tree Iterations",
		min: -1,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.iterations,
	}),
	new NumberOption({
		id: "modularColorspace",
		label: "Modular Colorspace",
		min: -1,
		max: 41,
		step: 1,
		defaultValue: defaultOptions.modularColorspace,
	}),
	new EnumOption({
		id: "modularPredictor",
		label: "Modular Predictor",
		enumObject: jxl.Predictor,
		defaultValue: "Default",
	}),
];

export function encode(options: jxl.Options, worker: ImageWorker) {
	options["gaborish"] = jxl.Override[options["gaborish"]];
	options["responsive"] = jxl.Override[options["responsive"]];
	options["qProgressiveAC"] = jxl.Override[options["qProgressiveAC"]];
	options["responsive"] = jxl.Override[options["responsive"]];
	options["modularPredictor"] = jxl.Predictor[options["modularPredictor"]];
	return worker.jxlEncode(options);
}
