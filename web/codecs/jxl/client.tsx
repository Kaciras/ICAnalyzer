import { Remote } from "comlink";
import { defaultOptions } from "squoosh/src/features/encoders/jxl/shared/meta";
import { WorkerApi } from "../../worker";
import { boolOption, numberOption, OptionType } from "../../form";
import { buildOptions, mergeOptions } from "../common";
import { ControlProps, ControlStateMap, EncoderState, OptionListProps } from "../index";
import { EncodeOptions } from "./codec";

export const name = "JPEG XL";
export const mimeType = "image/jxl";
export const extension = "jxl";

const templates: OptionType[] = [
	numberOption({ // 100 = lossless
		id: "quality",
		label: "Quality",
		min: 0,
		max: 100,
		step: 0.1,
		defaultValue: defaultOptions.quality,
	}),
	boolOption({
		id: "lossyPalette",
		label: "Slight loss",
		defaultValue: defaultOptions.lossyPalette,
	}),
	boolOption({
		id: "progressive",
		label: "Progressive",
		defaultValue: defaultOptions.progressive,
	}),
	numberOption({
		id: "speed",
		label: "Speed",
		min: 0,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.speed,
	}),
	numberOption({
		id: "epf",
		label: "Edge preserving filter",
		min: -1,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.epf,
	}),
];

export function initControlState(state: EncoderState): ControlStateMap {
	const { varNames, ranges, values } = state;
	const labels: Record<string, string[]> = {};

	for (const t of templates) {
		if (!varNames.includes(t.id)) {
			continue;
		}
		const init = t.initControlValue(ranges[t.id]);
		values[t.id] = init.value;
		labels[t.id] = init.labels;
	}
	return { values, labels };
}

export function initOptionsState(saved?: EncoderState): EncoderState {
	if (saved) {
		return saved;
	}
	const values: Record<string, any> = {};
	const ranges: Record<string, any> = {};

	for (const t of templates) {
		const [value, range] = t.newOptionState();
		values[t.id] = value;
		ranges[t.id] = range;
	}
	return { varNames: [], values, ranges };
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

export function Controls(props: ControlProps) {
	const { state, variableName, onChange, onVariableChange } = props;
	const { varNames, values, ranges } = state;

	const fields = templates
		.filter(t => varNames.includes(t.id))
		.map(({ id, ControlField }) => {

			function handleChange(nval: any) {
				onVariableChange(id);
				onChange({ ...values, [id]: nval });
			}

			return <ControlField
				key={id}
				active={id === variableName}
				value={values[id]}
				range={ranges[id]}
				onFocus={() => onVariableChange(id)}
				onChange={handleChange}
			/>;
		});

	return <>{fields}</>;
}

export function getOptionsList(state: EncoderState) {
	return buildOptions(templates, state);
}

export function encode(options: EncodeOptions, worker: Remote<WorkerApi>) {
	return worker.jxlEncode(mergeOptions(defaultOptions, options));
}
