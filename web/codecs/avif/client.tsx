import { Remote } from "comlink";
import { defaultOptions } from "squoosh/src/features/encoders/avif/shared/meta";
import { WorkerApi } from "../../worker";
import { EnumOption, NumberOption, OptionType } from "../../form";
import { EncoderState, OptionListProps } from "../index";
import { buildOptions, createState } from "../common";

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
		id: "minQuantizer",
		label: "Min quality",
		min: 0,
		max: 63,
		step: 1,
		defaultValue: defaultOptions.minQuantizer,
	}),
	new NumberOption({
		id: "maxQuantizer",
		label: "Max quality",
		min: 0,
		max: 63,
		step: 1,
		defaultValue: defaultOptions.maxQuantizer,
	}),
	new NumberOption({
		id: "minQuantizerAlpha",
		label: "Min alpha quality",
		min: 0,
		max: 63,
		step: 1,
		defaultValue: defaultOptions.minQuantizerAlpha,
	}),
	new NumberOption({
		id: "maxQuantizerAlpha",
		label: "Max alpha quality",
		min: 0,
		max: 63,
		step: 1,
		defaultValue: defaultOptions.maxQuantizerAlpha,
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
		step: 8,
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
	const { state, onChange } = props;
	const { varNames, values, ranges } = state;

	function handleVarChange(id: string, value: boolean) {
		let { varNames } = state;
		if (value) {
			varNames.push(id);
		} else {
			varNames = varNames.filter(v => v !== id);
		}
		onChange({ ...state, varNames });
	}

	function handleValueChange(id: string, value: any) {
		onChange({ ...state, values: { ...values, [id]: value } });
	}

	function handleRangeChange(id: string, range: any) {
		onChange({ ...state, ranges: { ...ranges, [id]: range } });
	}

	const items = templates.map(({ id, OptionField }) =>
		<OptionField
			key={id}
			isVariable={varNames.includes(id)}
			value={values[id]}
			range={ranges[id]}
			onValueChange={v => handleValueChange(id, v)}
			onRangeChange={v => handleRangeChange(id, v)}
			onVariabilityChange={v => handleVarChange(id, v)}
		/>,
	);

	return <>{items}</>;
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
