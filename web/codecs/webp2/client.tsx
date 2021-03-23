import { Remote } from "comlink";
import { WorkerApi } from "../../worker";
import { boolOption, enumOption, numberOption, OptionType } from "../../form";
import { EncodeOptions } from "./encoder";
import { ControlProps, ControlStateMap, EncoderState, OptionListProps } from "../index";
import { buildOptions, mergeOptions } from "../common";

export const name = "WebP v2";
export const mimeType = "image/webp2";
export const extension = "wp2";

export const UVMode = {
	"Adapt": 0,
	"420": 1,
	"444": 2,
	"Auto": 3,
};

export const Csp = {
	YCoCg: 0,
	YCbCr: 1,
	Custom: 2,
	YIQ: 3,
};

const defaultOptions: EncodeOptions = {
	quality: 75,
	alpha_quality: 75,
	effort: 5,
	pass: 1,
	sns: 50,
	uv_mode: UVMode.Adapt,
	csp_type: Csp.YCoCg,
	error_diffusion: 0,
	use_random_matrix: false,
};

const templates: OptionType[] = [
	// boolOption({
	// 	id: "lossless",
	// 	label: "lossless",
	// 	defaultValue: defaultOptions.lossless,
	// }),
	numberOption({
		id: "quality",
		label: "Quality",
		min: 0,
		max: 95,
		step: 0.1,
		defaultValue: defaultOptions.quality,
	}),
	numberOption({
		id: "alpha_quality",
		label: "Alpha Quality",
		min: 0,
		max: 95,
		step: 0.1,
		defaultValue: defaultOptions.alpha_quality,
	}),
	numberOption({
		id: "effort",
		label: "Effort",
		min: 0,
		max: 9,
		step: 1,
		defaultValue: defaultOptions.effort,
	}),
	numberOption({
		id: "pass",
		label: "Passes",
		min: 0,
		max: 9,
		step: 1,
		defaultValue: defaultOptions.pass,
	}),
	numberOption({
		id: "sns",
		label: "Spatial noise shaping",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.sns,
	}),
	numberOption({
		id: "error_diffusion",
		label: "Error diffusion",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.error_diffusion,
	}),
	enumOption({
		id: "uv_mode",
		label: "UVMode",
		enumObject: UVMode,
		defaultValue: "Adapt",
	}),
	enumOption({
		id: "csp_type",
		label: "Color space",
		enumObject: Csp,
		defaultValue: "YCoCg",
	}),
	boolOption({
		id: "use_random_matrix",
		label: "Random matrix",
		defaultValue: defaultOptions.use_random_matrix,
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
	return worker.webp2Encode(mergeOptions(defaultOptions, options));
}
