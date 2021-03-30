import { Remote } from "comlink";
import { defaultOptions, EncodeOptions } from "squoosh/src/features/encoders/avif/shared/meta";
import { WorkerApi } from "../../worker";
import { enumOption, numberOption, OptionType } from "../../form";
import { ControlProps, ControlStateMap, EncoderState, OptionListProps } from "../index";
import { buildOptions } from "../common";

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
	numberOption({
		id: "minQuantizer",
		label: "Min quality",
		min: 0,
		max: 63,
		step: 1,
		defaultValue: defaultOptions.minQuantizer,
	}),
	numberOption({
		id: "maxQuantizer",
		label: "Max quality",
		min: 0,
		max: 63,
		step: 1,
		defaultValue: defaultOptions.maxQuantizer,
	}),
	numberOption({
		id: "minQuantizerAlpha",
		label: "Min alpha quality",
		min: 0,
		max: 63,
		step: 1,
		defaultValue: defaultOptions.minQuantizerAlpha,
	}),
	numberOption({
		id: "maxQuantizerAlpha",
		label: "Max alpha quality",
		min: 0,
		max: 63,
		step: 1,
		defaultValue: defaultOptions.maxQuantizerAlpha,
	}),
	numberOption({
		id: "tileRowsLog2",
		label: "Log2 of tile rows",
		min: 0,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.tileRowsLog2,
	}),
	numberOption({
		id: "tileColsLog2",
		label: "Log2 of tile cols",
		min: 0,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.tileColsLog2,
	}),
	numberOption({
		id: "speed",
		label: "Speed",
		min: 0,
		max: 10,
		step: 8,
		defaultValue: defaultOptions.speed,
	}),
	enumOption({
		id: "subsample",
		label: "Subsample",
		enumObject: Subsampling,
		defaultValue: "YUV420",
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

export function initOptionsState(saved: EncodeOptions) {
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
		.map(({ id, Controller }) => {

			function handleChange(nval: any) {
				onVariableChange(id);
				onChange({ ...values, [id]: nval });
			}

			return <Controller
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

export function encode(options: any, worker: Remote<WorkerApi>) {
	return worker.avifEncode({ ...defaultOptions, ...options });
}
