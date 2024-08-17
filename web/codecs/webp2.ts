import { wp2 } from "icodec";
import { ImageWorker } from "../features/image-worker.ts";
import { BoolOption, EnumOption, NumberOption, OptionType } from "../form/index.ts";

export const name = "WebP v2";
export const mimeType = wp2.mimeType;
export const extension = wp2.extension;

export const defaultOptions = wp2.defaultOptions;

export const templates: OptionType[] = [
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
		min: 0,
		max: 9,
		step: 1,
		defaultValue: defaultOptions.effort,
	}),
	new NumberOption({
		id: "pass",
		label: "Passes",
		min: 0,
		max: 9,
		step: 1,
		defaultValue: defaultOptions.pass,
	}),
	new NumberOption({
		id: "sns",
		label: "Spatial noise shaping",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.sns,
	}),
	new NumberOption({
		id: "errorDiffusion",
		label: "Error diffusion",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.errorDiffusion,
	}),
	new EnumOption({
		id: "uvMode",
		label: "Subsample chroma",
		enumObject: wp2.UVMode,
		defaultValue: "UVAuto",
	}),
	new EnumOption({
		id: "cspType",
		label: "Color space",
		enumObject: wp2.Csp,
		defaultValue: "YCoCg",
	}),
	new BoolOption({
		id: "useRandomMatrix",
		label: "Random matrix",
		defaultValue: defaultOptions.useRandomMatrix,
	}),
];

export function encode(options: wp2.Options, worker: ImageWorker) {
	options.uvMode = wp2.UVMode[options.uvMode];
	options.cspType = wp2.Csp[options.cspType];
	return worker.webp2Encode(options);
}
