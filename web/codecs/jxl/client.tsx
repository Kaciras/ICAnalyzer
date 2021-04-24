import { Remote } from "comlink";
import { defaultOptions } from "squoosh/src/features/encoders/jxl/shared/meta";
import { WorkerApi } from "../../worker";
import { BoolOption, NumberOption, OptionType } from "../../form";
import { buildOptions, createState, mergeOptions } from "../common";
import { EncoderState, OptionListProps } from "../index";
import { EncodeOptions } from "./codec";

export const name = "JPEG XL";
export const mimeType = "image/jxl";
export const extension = "jxl";

const templates: OptionType[] = [
	new NumberOption({ // 100 = lossless
		id: "quality",
		label: "Quality",
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
	new BoolOption({
		id: "progressive",
		label: "Progressive",
		defaultValue: defaultOptions.progressive,
	}),
	new NumberOption({
		id: "speed",
		label: "Speed",
		min: 0,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.speed,
	}),
	new NumberOption({
		id: "epf",
		label: "Edge preserving filter",
		min: -1,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.epf,
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

export function encode(options: EncodeOptions, worker: Remote<WorkerApi>) {
	return worker.jxlEncode(mergeOptions(defaultOptions, options));
}
