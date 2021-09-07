import { ImageWorker } from "../../features/image-worker";
import { BoolOption, NumberOption, OptionType } from "../../form";
import { buildOptions, createState, mergeOptions, renderOption } from "../common";
import { EncoderState, OptionPanelProps } from "../index";
import { defaultOptions, EncodeOptions } from "./codec";

export const name = "JPEG XL";
export const mimeType = "image/jxl";
export const extension = "jxl";

const templates: OptionType[] = [
	new NumberOption({
		id: "quality",
		label: "Quality (100 = lossless)",
		min: 0,
		max: 100,
		step: 0.1,
		defaultValue: defaultOptions.quality,
	}),
	new BoolOption({
		id: "lossyPalette",
		label: "Slight loss",
		defaultValue: defaultOptions.lossyPalette,
	}),
	new NumberOption({
		id: "epf",
		label: "Edge preserving filter (-1 = auto)",
		min: -1,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.epf,
	}),
	new NumberOption({
		id: "decodingSpeedTier",
		label: "Optimise for decoding speed",
		min: 0,
		max: 4,
		step: 1,
		defaultValue: defaultOptions.decodingSpeedTier,
	}),
	new BoolOption({
		id: "progressive",
		label: "Progressive",
		defaultValue: defaultOptions.progressive,
	}),
	new NumberOption({
		id: "speed",
		label: "Effort",
		min: 0,
		max: 6,
		step: 1,
		mapFn: v => 7 - v,
		defaultValue: defaultOptions.speed,
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

export function encode(options: EncodeOptions, worker: ImageWorker) {
	return worker.jxlEncode(mergeOptions(defaultOptions, options));
}
