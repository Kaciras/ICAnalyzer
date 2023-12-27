import { ImageWorker } from "../../features/image-worker.ts";
import { BoolOption, EnumOption, NumberOption, OptionType } from "../../form/index.ts";
import OptionsGenerator from "../OptionsGenerator.tsx";
import { Csp, defaultOptions, EncodeOptions, Subsample } from "./codec.ts";

export const name = "WebP v2";
export const mimeType = "image/webp2";
export const extension = "wp2";

const templates: OptionType[] = [
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
		label: "Alpha Quality",
		min: 0,
		max: 95,
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
		enumObject: Subsample,
		defaultValue: "Auto",
	}),
	new EnumOption({
		id: "csp_type",
		label: "Color space",
		enumObject: Csp,
		defaultValue: "YCoCg",
	}),
	new BoolOption({
		id: "use_random_matrix",
		label: "Random matrix",
		defaultValue: defaultOptions.use_random_matrix,
	}),
];

export const optionsGenerator = new OptionsGenerator(templates, defaultOptions);

export function encode(options: EncodeOptions, worker: ImageWorker) {
	return worker.webp2Encode(options);
}
