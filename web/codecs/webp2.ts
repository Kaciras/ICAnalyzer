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
		label: "Quality (100 = lossless)",
		min: 0,
		max: 100,
		step: 0.1,
		defaultValue: defaultOptions.quality,
	}),
	new NumberOption({
		id: "alpha_quality",
		label: "Alpha Quality (100 = lossless)",
		min: 0,
		max: 100,
		step: 0.1,
		defaultValue: defaultOptions.alpha_quality,
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
		id: "error_diffusion",
		label: "Error diffusion",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.error_diffusion,
	}),
	new EnumOption({
		id: "uv_mode",
		label: "Subsample chroma",
		enumObject: wp2.UVMode,
		defaultValue: "UVAuto",
	}),
	new EnumOption({
		id: "csp_type",
		label: "Color space",
		enumObject: wp2.Csp,
		defaultValue: "YCoCg",
	}),
	new BoolOption({
		id: "use_random_matrix",
		label: "Random matrix",
		defaultValue: defaultOptions.use_random_matrix,
	}),
];

export function encode(options: wp2.Options, worker: ImageWorker) {
	options.uv_mode = wp2.UVMode[options.uv_mode];
	options.csp_type = wp2.Csp[options.csp_type];
	return worker.webp2Encode(options);
}
