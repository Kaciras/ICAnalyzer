import { Remote } from "comlink";
import { WorkerApi } from "../../worker";
import { boolOption, enumOption, numberOption, OptionType } from "../../form";
import { EncodeOptions } from "./codec";
import { ControlProps, ControlStateMap, EncoderState, OptionListProps } from "../index";
import { buildOptions, mergeOptions } from "../common";

export const name = "MozJPEG";
export const mimeType = "image/jpeg";
export const extension = "jpg";

const ColorSpace = {
	GRAYSCALE: 1,
	RGB: 2,
	YCbCr: 3,
};

const Quantization = {
	"JPEG Annex K": 0,
	"Flat": 1,
	"MSSIM-tuned Kodak": 2,
	"ImageMagick": 3,
	"PSNR-HVS-M-tuned Kodak": 4,
	"Klein et al": 5,
	"Watson et al": 6,
	"Ahumada et al": 7,
	"Peterson et al": 8,
};

const defaultOptions: EncodeOptions = {
	quality: 75,
	baseline: false,
	arithmetic: false,
	progressive: true,
	optimize_coding: true,
	smoothing: 0,
	color_space: ColorSpace.YCbCr,
	quant_table: Quantization.ImageMagick,
	trellis_multipass: false,
	trellis_opt_zero: false,
	trellis_opt_table: false,
	trellis_loops: 1,
	auto_subsample: true,
	chroma_subsample: 2,
	separate_chroma_quality: false,
	chroma_quality: 75,
};

const templates: OptionType[] = [
	numberOption({
		id: "quality",
		label: "Quality (-q)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.quality,
	}),
	enumOption({
		id: "color_space",
		label: "Channels",
		enumObject: ColorSpace,
		defaultValue: "YCbCr",
	}),
	enumOption({
		id: "quant_table",
		label: "Quantization",
		enumObject: Quantization,
		defaultValue: "ImageMagick",
	}),
	boolOption({
		id: "arithmetic",
		label: "Arithmetic",
		defaultValue: defaultOptions.arithmetic,
	}),
	boolOption({
		id: "auto_subsample",
		label: "Auto subsample chroma",
		defaultValue: defaultOptions.auto_subsample,
	}),

	boolOption({
		id: "separate_chroma_quality",
		label: "Separate chroma quality",
		defaultValue: defaultOptions.separate_chroma_quality,
	}),
	numberOption({
		id: "chroma_quality",
		label: "Chroma quality",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.chroma_quality,
	}),

	numberOption({
		id: "smoothing",
		label: "Smoothing",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.smoothing,
	}),

	boolOption({
		id: "baseline",
		label: "Pointless spec compliance",
		defaultValue: defaultOptions.baseline,
	}),
	boolOption({
		id: "progressive",
		label: "Progressive",
		defaultValue: defaultOptions.progressive,
	}),
	boolOption({
		id: "optimize_coding",
		label: "Optimize Huffman table",
		defaultValue: defaultOptions.optimize_coding,
	}),

	boolOption({
		id: "trellis_multipass",
		label: "Trellis multipass",
		defaultValue: defaultOptions.trellis_multipass,
	}),
	boolOption({
		id: "trellis_opt_zero",
		label: "Optimize zero block runs",
		defaultValue: defaultOptions.trellis_opt_zero,
	}),
	boolOption({
		id: "trellis_opt_table",
		label: "Optimize after trellis quantization",
		defaultValue: defaultOptions.trellis_opt_table,
	}),
	numberOption({
		id: "trellis_loops",
		label: "Trellis quantization passes",
		min: 0,
		max: 50,
		step: 1,
		defaultValue: defaultOptions.trellis_loops,
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
	return worker.mozjpegEncode(mergeOptions(defaultOptions, options));
}
