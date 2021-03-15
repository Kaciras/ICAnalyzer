import { Remote } from "comlink";
import { defaultOptions } from "squoosh/src/features/encoders/avif/shared/meta";
import { WorkerApi } from "../../worker";
import numberOption from "../../form/NumberField";
import enumOption from "../../form/EnumField";
import { ControlProps, OptionListProps } from "../index";

export const name = "AVIF";
export const mimeType = "image/avif";
export const extension = "avif";

export const Subsampling = {
	YUV400: 0,
	YUV420: 1,
	YUV422: 2,
	YUV444: 3,
};

const template = [
	numberOption({
		property: "minQuantizer",
		label: "Min quality",
		min: 0,
		max: 63,
		step: 1,
		defaultValue: defaultOptions.minQuantizer,
	}),
	numberOption({
		property: "maxQuantizer",
		label: "Max quality",
		min: 0,
		max: 63,
		step: 1,
		defaultValue: defaultOptions.maxQuantizer,
	}),
	numberOption({
		property: "minQuantizerAlpha",
		label: "Min alpha quality",
		min: 0,
		max: 63,
		step: 1,
		defaultValue: defaultOptions.minQuantizerAlpha,
	}),
	numberOption({
		property: "maxQuantizerAlpha",
		label: "Max alpha quality",
		min: 0,
		max: 63,
		step: 1,
		defaultValue: defaultOptions.maxQuantizerAlpha,
	}),
	numberOption({
		property: "tileRowsLog2",
		label: "Log2 of tile rows",
		min: 0,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.tileRowsLog2,
	}),
	numberOption({
		property: "tileColsLog2",
		label: "Log2 of tile cols",
		min: 0,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.tileColsLog2,
	}),
	numberOption({
		property: "speed",
		label: "Speed",
		min: 0,
		max: 10,
		step: 8,
		defaultValue: defaultOptions.speed,
	}),
	enumOption({
		property: "subsample",
		label: "Subsample",
		enumObject: Subsampling,
		defaultValue: "YUV420",
	}),
];

export function getDefaultOptions() {
	return <div/>;
}

export function OptionsPanel(props: OptionListProps) {
	return <div/>;
}

export function Controls(props: ControlProps) {
	return <div/>;
}

export function encode(options: any, worker: Remote<WorkerApi>) {
	return worker.avifEncode(options);
}
