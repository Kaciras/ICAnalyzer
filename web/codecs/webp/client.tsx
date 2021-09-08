import { ImageWorker } from "../../features/image-worker";
import { BoolOption, EnumOption, NumberOption, OptionType } from "../../form";
import { defaultOptions, EncodeOptions } from "./codec";
import { EncoderState, OptionPanelProps } from "../index";
import { buildOptions, createState, mergeOptions, renderOption } from "../common";

export const name = "WebP";
export const mimeType = "image/webp";
export const extension = "webp";

const Preprocess = {
	"None": 0,
	"Segment smooth": 1,
	"Dithering": 2,
};

const templates: OptionType[] = [
	new BoolOption({
		id: "lossless",
		label: "lossless",
		defaultValue: defaultOptions.lossless,
	}),
	new NumberOption({
		id: "method",
		label: "Method (-m)",
		min: 0,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.method,
	}),
	new NumberOption({
		id: "quality",
		label: "Quality (-q)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.quality,
	}),
	new NumberOption({
		id: "near_lossless",
		label: "Near lossless (-near_lossless)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.near_lossless,
	}),
	new BoolOption({
		id: "autofilter",
		label: "Auto adjust filter strength (-af)",
		defaultValue: defaultOptions.autofilter,
	}),
	new NumberOption({
		id: "filter_strength",
		label: "Filter strength (-f)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.filter_strength,
	}),
	new BoolOption({
		id: "filter_type",
		label: "User strong filter (-strong)",
		defaultValue: defaultOptions.filter_type,
	}),
	new NumberOption({
		id: "filter_sharpness",
		label: "Filter sharpness (-sharpness)",
		min: 0,
		max: 7,
		step: 1,
		defaultValue: defaultOptions.filter_sharpness,
	}),
	new BoolOption({
		id: "use_sharp_yuv",
		label: "Sharp YUV",
		defaultValue: defaultOptions.use_sharp_yuv,
	}),
	new NumberOption({
		id: "pass",
		label: "Passes",
		min: 1,
		max: 10,
		step: 1,
		defaultValue: defaultOptions.pass,
	}),
	new NumberOption({
		id: "sns_strength",
		label: "Spatial noise shaping (-sns)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.sns_strength,
	}),
	new EnumOption({
		id: "preprocessing",
		label: "Preprocess",
		enumObject: Preprocess,
		defaultValue: "None",
	}),
	new NumberOption({
		id: "segments",
		label: "Segments",
		min: 1,
		max: 4,
		step: 1,
		defaultValue: defaultOptions.segments,
	}),

	// There is no image_hint option since it have no effect.
];

export function getState(saved?: EncoderState) {
	return saved ?? createState(templates);
}

export function OptionsPanel(props: OptionPanelProps) {
	return <>{templates.map(t => renderOption(t, props))}</>;
}

export function getOptionsList(state: EncoderState) {
	return buildOptions(templates, state);
}

export function getControls(state: EncoderState) {
	return templates
		.filter(t => state[t.id].isVariable)
		.map(t => t.createControl(state[t.id].range));
}

export function encode(options: EncodeOptions, worker: ImageWorker) {
	return worker.webpEncode(mergeOptions(defaultOptions, options));
}
