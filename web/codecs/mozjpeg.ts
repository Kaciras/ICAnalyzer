import { jpeg } from "icodec";
import { ImageWorker } from "../features/image-worker.ts";
import { BoolOption, EnumOption, NumberOption, OptionType } from "../form/index.ts";

export const name = "MozJPEG";
export const mimeType = jpeg.mimeType;
export const extension = jpeg.extension;

export const defaultOptions = jpeg.defaultOptions;

export const templates: OptionType[] = [
	new NumberOption({
		id: "quality",
		label: "Quality (-q)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.quality,
	}),
	new EnumOption({
		id: "colorSpace",
		label: "Channels",
		enumObject: jpeg.ColorSpace,
		defaultValue: "YCbCr",
	}),
	new BoolOption({
		id: "autoSubsample",
		label: "Auto subsample chroma",
		defaultValue: defaultOptions.autoSubsample,
	}),
	new BoolOption({
		id: "separateChromaQuality",
		label: "Separate chroma quality",
		defaultValue: defaultOptions.separateChromaQuality,
	}),
	new NumberOption({
		id: "chromaQuality",
		label: "Chroma quality",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.chromaQuality,
	}),
	new BoolOption({
		id: "baseline",
		label: "Pointless spec compliance",
		defaultValue: defaultOptions.baseline,
	}),
	new BoolOption({
		id: "progressive",
		label: "Progressive",
		defaultValue: defaultOptions.progressive,
	}),
	new BoolOption({  // Visible when baseline enabled in Squoosh
		id: "optimizeCoding",
		label: "Optimize Huffman table",
		defaultValue: defaultOptions.optimizeCoding,
	}),
	new NumberOption({
		id: "smoothing",
		label: "Smoothing",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.smoothing,
	}),
	new EnumOption({
		id: "quantTable",
		label: "Quantization",
		enumObject: jpeg.Quantization,
		defaultValue: "ImageMagick",
	}),
	new BoolOption({
		id: "trellisMultipass",
		label: "Trellis multipass",
		defaultValue: defaultOptions.trellisMultipass,
	}),
	new BoolOption({ // Visible when trellis_multipass enabled in Squoosh
		id: "trellisOptZero",
		label: "Optimize zero block runs",
		defaultValue: defaultOptions.trellisOptZero,
	}),
	new BoolOption({
		id: "trellisOptTable",
		label: "Optimize after trellis quantization",
		defaultValue: defaultOptions.trellisOptTable,
	}),
	new NumberOption({
		id: "trellisLoops",
		label: "Trellis quantization passes",
		min: 0,
		max: 50,
		step: 1,
		defaultValue: defaultOptions.trellisLoops,
	}),
];

export function encode(options: jpeg.Options, worker: ImageWorker) {
	options.colorSpace = jpeg.ColorSpace[options.colorSpace];
	options.quantTable = jpeg.Quantization[options.quantTable];
	return worker.mozjpegEncode(options);
}
