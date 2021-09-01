import { Remote } from "comlink";
import { ImageWorkerApi } from "../../worker";
import { BoolOption, EnumOption, NumberOption, OptionType, PresetOption } from "../../form";
import { defaultOptions, EncodeOptions } from "./codec";
import { EncoderState, OptionPanelProps } from "../index";
import { buildOptions, createState, mergeOptions, renderOption } from "../common";

export const name = "WebP";
export const mimeType = "image/webp";
export const extension = "webp";

const WebPImageHint = {
	Default: 0,
	Picture: 1,
	Photo: 2,
	Graph: 3,
};

// https://github.com/webmproject/libwebp/blob/83604bf3ac2212a353c53d8c9df35d94fa9ab000/src/enc/config_enc.c#L62
const WebPPreset = {
	default: {
		// nothing to do.
	},
	photo: {
		sns_strength: 80,
		filter_sharpness: 3,
		filter_strength: 30,
		preprocessing: (v: number) => v | 2,
	},
	picture: {
		sns_strength: 80,
		filter_sharpness: 4,
		filter_strength: 35,
		preprocessing: (v: number) => v & ~2,
	},
	drawing: {
		sns_strength: 25,
		filter_sharpness: 6,
		filter_strength: 10,
	},
	icon: {
		sns_strength: 25,
		filter_strength: 10,
		preprocessing: (v: number) => v & ~2,
	},
	text: {
		sns_strength: 0,
		filter_strength: 0,
		segments: 2,
		preprocessing: (v: number) => v & ~2,
	},
};

const templates: OptionType[] = [
	new BoolOption({
		id: "lossless",
		label: "lossless",
		defaultValue: defaultOptions.lossless,
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
	new NumberOption({
		id: "method",
		label: "Method (-m)",
		min: 0,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.method,
	}),
	new PresetOption({
		id: "preset",
		label: "Preset (-preset)",
		enumObject: WebPPreset,
		defaultValue: "default",
	}),
	new NumberOption({
		id: "sns_strength",
		label: "Spatial noise shaping (-sns)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.sns_strength,
	}),
	new BoolOption({
		id: "filter_type",
		label: "User strong filter (-strong)",
		defaultValue: defaultOptions.filter_type,
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
	new EnumOption({
		id: "image_hint",
		label: "Hint (-hint)",
		enumObject: WebPImageHint,
		defaultValue: "Default",
	}),
];

export function getState(saved?: EncoderState): EncoderState {
	if (saved) {
		return saved;
	}
	const { values, ranges } = createState(templates);
	(ranges.quality as any).step = 5;
	return { varNames: ["quality"], values, ranges };
}

export function OptionsPanel(props: OptionPanelProps) {
	return <>{templates.map(t => renderOption(t, props))}</>;
}

export function getOptionsList(state: EncoderState) {
	return buildOptions(templates, state);
}

export function getControls(state: EncoderState) {
	const { varNames, ranges } = state;
	return templates
		.filter(t => varNames.includes(t.id))
		.map(t => t.createControl(ranges[t.id]));
}

export function encode(options: EncodeOptions, worker: Remote<ImageWorkerApi>) {
	return worker.webpEncode(mergeOptions(defaultOptions, options));
}
