import { Remote } from "comlink";
import { defaultOptions } from "squoosh/src/features/encoders/avif/shared/meta";
import { WorkerApi } from "../../worker";
import { BoolOption, EnumOption, NumberOption, OptionType } from "../../form";
import { EncoderState, OptionListProps } from "../index";
import { buildOptions, createState, renderOption } from "../common";

export const name = "AVIF";
export const mimeType = "image/avif";
export const extension = "avif";

export const Subsampling = {
	YUV400: 0,
	YUV420: 1,
	YUV422: 2,
	YUV444: 3,
};

const templates: OptionType[] = [
	new NumberOption({
		id: "cqLevel",
		label: "Quality",
		min: 0,
		max: 63,
		step: 1,
		mapFn: i => 63 - i,
		defaultValue: defaultOptions.cqLevel,
	}),
	new NumberOption({
		id: "cqAlphaLevel",
		label: "Alpha quality",
		min: -1,
		max: 63,
		step: 1,
		mapFn: i => 63 - i,
		defaultValue: defaultOptions.cqAlphaLevel,
	}),
	new NumberOption({
		id: "sharpness",
		label: "Sharpness",
		min: 0,
		max: 7,
		step: 1,
		defaultValue: defaultOptions.sharpness,
	}),
	new NumberOption({
		id: "denoiseLevel",
		label: "Noise synthesis",
		min: 0,
		max: 50,
		step: 1,
		defaultValue: defaultOptions.denoiseLevel,
	}),
	new BoolOption({
		id: "chromaDeltaQ",
		label: "Extra chroma compression",
		defaultValue: defaultOptions.chromaDeltaQ,
	}),
	new NumberOption({
		id: "tileRowsLog2",
		label: "Log2 of tile rows",
		min: 0,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.tileRowsLog2,
	}),
	new NumberOption({
		id: "tileColsLog2",
		label: "Log2 of tile cols",
		min: 0,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.tileColsLog2,
	}),
	new NumberOption({
		id: "speed",
		label: "Speed",
		min: 0,
		max: 10,
		step: 1,
		defaultValue: defaultOptions.speed,
	}),
	new EnumOption({
		id: "subsample",
		label: "Subsample",
		enumObject: Subsampling,
		defaultValue: "YUV420",
	}),
];

export function getState(saved?: EncoderState) {
	return saved ?? createState(templates);
}

export function OptionsPanel(props: OptionListProps) {
	return <>{templates.map(t => renderOption(t, props))}</>;
}

export function getOptionsList(state: EncoderState) {
	const { varNames, ranges } = state;
	const optionsList = buildOptions(templates, state);
	const controls = templates.filter(t => varNames.includes(t.id)).map(t => t.createControl(ranges[t.id]));
	return { controls, optionsList };
}

export function encode(options: any, worker: Remote<WorkerApi>) {
	return worker.avifEncode({ ...defaultOptions, ...options });
}
