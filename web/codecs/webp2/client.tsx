import { Remote } from "comlink";
import { WorkerApi } from "../../worker";
import { BoolOption, EnumOption, NumberOption, OptionType } from "../../form";
import { Csp, defaultOptions, EncodeOptions, UVMode } from "./codec";
import { EncoderState, OptionPanelProps } from "../index";
import { buildOptions, createState, mergeOptions, renderOption } from "../common";

export const name = "WebP v2";
export const mimeType = "image/webp2";
export const extension = "wp2";

const templates: OptionType[] = [
	// new BoolOption({
	// 	id: "lossless",
	// 	label: "lossless",
	// 	defaultValue: defaultOptions.lossless,
	// }),
	new NumberOption({
		id: "quality",
		label: "Quality",
		min: 0,
		max: 95,
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
		label: "UVMode",
		enumObject: UVMode,
		defaultValue: "Adapt",
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
	const { varNames, ranges } = state;
	return templates
		.filter(t => varNames.includes(t.id))
		.map(t => t.createControl(ranges[t.id]));
}

export function encode(options: EncodeOptions, worker: Remote<WorkerApi>) {
	return worker.webp2Encode(mergeOptions(defaultOptions, options));
}
