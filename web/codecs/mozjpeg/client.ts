import { ImageWorker } from "../../features/image-worker.ts";
import { BoolOption, EnumOption, NumberOption, OptionType } from "../../form/index.ts";
import OptionsGenerator from "../OptionsGenerator.tsx";
import { ColorSpace, defaultOptions, EncodeOptions, Quantization } from "./codec.ts";

export const name = "MozJPEG";
export const mimeType = "image/jpeg";
export const extension = "jpg";

const templates: OptionType[] = [
	new NumberOption({
		id: "quality",
		label: "Quality (-q)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.quality,
	}),
	new EnumOption({
		id: "color_space",
		label: "Channels",
		enumObject: ColorSpace,
		defaultValue: "YCbCr",
	}),
	new BoolOption({
		id: "auto_subsample",
		label: "Auto subsample chroma",
		defaultValue: defaultOptions.auto_subsample,
	}),
	new BoolOption({
		id: "separate_chroma_quality",
		label: "Separate chroma quality",
		defaultValue: defaultOptions.separate_chroma_quality,
	}),
	new NumberOption({
		id: "chroma_quality",
		label: "Chroma quality",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.chroma_quality,
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
		id: "optimize_coding",
		label: "Optimize Huffman table",
		defaultValue: defaultOptions.optimize_coding,
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
		id: "quant_table",
		label: "Quantization",
		enumObject: Quantization,
		defaultValue: "ImageMagick",
	}),
	new BoolOption({
		id: "trellis_multipass",
		label: "Trellis multipass",
		defaultValue: defaultOptions.trellis_multipass,
	}),
	new BoolOption({ // Visible when trellis_multipass enabled in Squoosh
		id: "trellis_opt_zero",
		label: "Optimize zero block runs",
		defaultValue: defaultOptions.trellis_opt_zero,
	}),
	new BoolOption({
		id: "trellis_opt_table",
		label: "Optimize after trellis quantization",
		defaultValue: defaultOptions.trellis_opt_table,
	}),
	new NumberOption({
		id: "trellis_loops",
		label: "Trellis quantization passes",
		min: 0,
		max: 50,
		step: 1,
		defaultValue: defaultOptions.trellis_loops,
	}),
];

export const optionsGenerator = new OptionsGenerator(templates, defaultOptions);

export function encode(options: EncodeOptions, worker: ImageWorker) {
	return worker.mozjpegEncode(options);
}
