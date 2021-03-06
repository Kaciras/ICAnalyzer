import { Remote } from "comlink";
import { WorkerApi } from "../../worker";
import { ControlProps, OptionListProps, State } from "../index";
import { EncodeOptions } from "./encoder";
import { EnumTemplate } from "../../form/EnumField";
import { defaultOptions } from "squoosh/src/features/encoders/webP/shared/meta";
import numberRange from "../../form/NumberField";

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

class WebPMode extends EnumTemplate<string> {

	generate(name: string, options: EncodeOptions, value: any): any[] {
		if (value.lossless) {
			options.lossless = 1;
		}
	}
}

//
// export const optionTemplate: OptionTemplate[] = [
// 	{
// 		label: "Mode",
// 		name: "mode",
// 		type:
// 	},
// 	{
// 		label: "Quality (-q)",
// 		name: "quality",
// 		type: new NumberRangeTemplate(0, 100, 75),
// 		defaultVariable: true,
// 	},
// 	{
// 		label: "Method (-m)",
// 		name: "method",
// 		type: new NumberRangeTemplate(0, 6, 4),
// 	},
// 	{
// 		label: "Spatial noise shaping (-sns)",
// 		name: "sns",
// 		type: new NumberRangeTemplate(0, 100, 50),
// 	},
// 	{
// 		label: "Filter strength (-f)",
// 		name: "filter_strength",
// 		type: new NumberRangeTemplate(0, 100, 60),
// 	},
// 	{
// 		label: "Preset (-preset)",
// 		name: "preset",
// 		type: new EnumTemplate(WebPPreset, "default"),
// 	},
// 	{
// 		label: "User strong filter (-strong)",
// 		name: "filter_type",
// 		type: new BooleanTemplate(true),
// 	},
// 	{
// 		label: "Auto adjust filter strength (-af)",
// 		name: "autofilter",
// 		type: new BooleanTemplate(false),
// 	},
// 	{
// 		label: "Filter sharpness (-sharpness)",
// 		name: "filter_sharpness",
// 		type: new NumberRangeTemplate(0, 7, 0),
// 	},
// 	{
// 		label: "Hint (-hint)",
// 		name: "image_hint",
// 		type: new EnumTemplate(WebPImageHint, "DEFAULT"),
// 	},
// ];

export function getDefaultOptions(): State {
	return {
		varNames: [],
		values: defaultOptions,
		variables: {},
	};
}

const template = [
	numberRange({
		property: "quality",
		label: "Quality (-q)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.quality,
	}),
];

export function OptionsPanel(props: OptionListProps) {
	const { state = getDefaultOptions(), onChange } = props;
	const v = template.map(Template => <Template.OptionField state={state} onChange={onChange}/>)
	return <>{v}</>;
}

export function Controls(props: ControlProps) {
	return <div/>;
}

export function getOptionsList(state: State) {
	let result = [{ ... defaultOptions }];
	for (const t of template) {
		result = t.generate(state, result[0]);
	}
	return result;
}

export function encode(options: any, worker: Remote<WorkerApi>) {
	return worker.webpEncode(options);
}
