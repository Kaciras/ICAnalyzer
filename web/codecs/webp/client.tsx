import { Remote } from "comlink";
import { WorkerApi } from "../../worker";
import { ControlProps, EncoderState, OptionListProps } from "../index";
import { EncodeOptions } from "./encoder";
import enumOption from "../../form/EnumField";
import { defaultOptions } from "squoosh/src/features/encoders/webP/shared/meta";
import numberOption from "../../form/NumberField";
import boolOption from "../../form/BooleanField";
import { OptionType } from "../../form/base";

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
		preprocessing: 2,
	},
	picture: {
		sns_strength: 80,
		filter_sharpness: 4,
		filter_strength: 35,
		preprocessing: ~2,
	},
	drawing: {
		sns_strength: 25,
		filter_sharpness: 6,
		filter_strength: 10,
	},
	icon: {
		sns_strength: 25,
		filter_strength: 10,
		preprocessing: ~2,
	},
	text: {
		sns_strength: 0,
		filter_strength: 0,
		segments: 2,
		preprocessing: ~2,
	},
};

const templates: OptionType[] = [
	boolOption({
		property: "lossless",
		label: "lossless",
		defaultValue: defaultOptions.lossless,
	}),
	numberOption({
		property: "quality",
		label: "Quality (-q)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.quality,
	}),
	numberOption({
		property: "near_lossless",
		label: "Near lossless (-near_lossless)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.near_lossless,
	}),
	numberOption({
		property: "method",
		label: "Method (-m)",
		min: 0,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.method,
	}),
	enumOption({
		property: "preset",
		label: "Preset (-preset)",
		enumObject: WebPPreset,
		defaultValue: "default",
	}),
	numberOption({
		property: "sns",
		label: "Spatial noise shaping (-sns)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.sns,
	}),
	boolOption({
		property: "filter_type",
		label: "User strong filter (-strong)",
		defaultValue: defaultOptions.filter_type,
	}),

	boolOption({
		property: "autofilter",
		label: "Auto adjust filter strength (-af)",
		defaultValue: defaultOptions.autofilter,
	}),
	numberOption({
		property: "filter_strength",
		label: "Filter strength (-f)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.filter_strength,
	}),
	numberOption({
		property: "filter_sharpness",
		label: "Filter sharpness (-sharpness)",
		min: 0,
		max: 7,
		step: 1,
		defaultValue: defaultOptions.filter_sharpness,
	}),
	enumOption({
		property: "image_hint",
		label: "Hint (-hint)",
		enumObject: WebPImageHint,
		defaultValue: "Default",
	}),
];

export function initControlState(state: EncoderState): Record<string, unknown> {
	const { varNames, ranges, values } = state;

	templates
		.filter(t => varNames.includes(t.id))
		.forEach(t => values[t.id] = t.initControlValue(ranges[t.id]));

	return values;
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
	(ranges.quality as any).step = 5;
	return { varNames: ["quality"], values, ranges };
}

export function OptionsPanel(props: OptionListProps) {
	const { state, onChange } = props;
	const { varNames, values, ranges } = state;

	function handleVarChange(id: string, value: boolean) {
		let { varNames } = state;
		if (value) {
			varNames.push(id);
		} else {
			varNames = varNames.filter(v => v != id);
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
	const { varNames, values, ranges } = state;

	function map(list: any[], t: OptionType) {
		return list
			.map(options => {
				if (varNames.includes(t.id)) {
					return t.generate(ranges[t.id], options);
				}
				t.populate(values[t.id], options);
				return [options];
			})
			.reduce((p, c) => p.concat(c), []);
	}

	return templates.reduce(map, [{}] as EncodeOptions[]);
}

export function encode(options: EncodeOptions, worker: Remote<WorkerApi>) {
	return worker.webpEncode({ ...defaultOptions, ...options });
}
