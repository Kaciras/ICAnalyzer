import { Remote } from "comlink";
import { WorkerApi } from "../../worker";
import { ControlProps, OptionListProps, State } from "../index";
import { EncodeOptions } from "./encoder";
import enumOption from "../../form/EnumField";
import { defaultOptions } from "squoosh/src/features/encoders/webP/shared/meta";
import numberRange from "../../form/NumberField";
import { useState } from "react";
import boolOption from "../../form/BooleanField";

export const name = "WebP";
export const mimeType = "image/webp";
export const extension = "webp";

const WebPImageHint = {
	DEFAULT: 0,
	PICTURE: 1,
	PHOTO: 2,
	GRAPH: 3,
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

export function getDefaultOptions(): State {
	return {
		varNames: [],
		values: defaultOptions,
		variables: {},
	};
}

const template = [
	boolOption({
		property: "lossless",
		label: "lossless",
		defaultValue: defaultOptions.lossless,
	}),
	numberRange({
		property: "quality",
		label: "Quality (-q)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.quality,
	}),
	numberRange({
		property: "method",
		label: "Method (-m)",
		min: 0,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.method,
	}),
	numberRange({
		property: "sns",
		label: "Spatial noise shaping (-sns)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.sns,
	}),
	enumOption({
		property: "preset",
		label: "Preset (-preset)",
		enumObject: WebPPreset,
		defaultValue: "default",
	}),
	boolOption({
		property: "filter_type",
		label: "User strong filter (-strong)",
		defaultValue: defaultOptions.filter_type,
	}),
	numberRange({
		property: "filter_strength",
		label: "Filter strength (-f)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.filter_strength,
	}),
	boolOption({
		property: "autofilter",
		label: "Auto adjust filter strength (-af)",
		defaultValue: defaultOptions.autofilter,
	}),
	numberRange({
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
		defaultValue: "DEFAULT",
	}),
];

export function OptionsPanel(props: OptionListProps) {
	const { state = getDefaultOptions(), onChange } = props;
	const v = template.map(({ id, OptionField }) => <OptionField key={id} state={state} onChange={onChange}/>);
	return <>{v}</>;
}

export function Controls(props: ControlProps) {
	const { state, onChange, onSeriesChange } = props;

	const [values, setValues] = useState(state.values);

	const localState = { ...state, values };

	const fields = template
		.filter(t => state.varNames.includes(t.id))
		.map(({ id, ValueField }) => {

			function handleChange(nval: any) {
				const newValues = { ...values, [id]: nval };
				setValues(newValues);
				const optList = getOptionsList({ ...state, varNames: [], values: newValues });
				onChange(optList[0]);
			}

			function handleFocus() {
				const varNames = [id];
				const series = getOptionsList({ ...state, varNames, values });
				onSeriesChange(series);
			}

			return <ValueField key={id} state={localState} onFocus={handleFocus} onChange={handleChange}/>;
		});

	return <>{fields}</>;
}

export function getOptionsList(state: State) {
	let result = [{ ...defaultOptions }];
	for (const t of template) {
		result = t.generate(state, result[0]);
	}
	return result as EncodeOptions[];
}

export function encode(options: EncodeOptions, worker: Remote<WorkerApi>) {
	return worker.webpEncode(options);
}
