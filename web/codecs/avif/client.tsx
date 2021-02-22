import { Remote } from "comlink";
import { WorkerApi } from "../../worker";
import { ControlProps, OptionListProps, OptionTemplate } from "../index";
import { NumberRangeTemplate } from "../../app/OptionTemplate";
import { EnumTemplate } from "../../form/EnumField";

export const name = "AVIF";
export const mimeType = "image/avif";
export const extension = "avif";

export const Subsampling = {
	YUV400: 0,
	YUV420: 1,
	YUV422: 2,
	YUV444: 3,
};

export function encode(options: any, worker: Remote<WorkerApi>) {
	return worker.avifEncode(options);
}

export const optionTemplate: OptionTemplate[] = [
	{
		label: "minQuantizer",
		name: "minQuantizer",
		type: new NumberRangeTemplate(0, 63, 33),
		defaultVariable: true,
	},
	{
		label: "maxQuantizer",
		name: "maxQuantizer",
		type: new NumberRangeTemplate(0, 63, 63),
	},
	{
		label: "minQuantizerAlpha",
		name: "minQuantizer",
		type: new NumberRangeTemplate(0, 63, 33),
		defaultVariable: true,
	},
	{
		label: "maxQuantizerAlpha",
		name: "maxQuantizerAlpha",
		type: new NumberRangeTemplate(0, 63, 63),
	},
	{
		label: "speed",
		name: "speed",
		type: new NumberRangeTemplate(0, 10, 8),
	},
	{
		label: "subsample",
		name: "subsample",
		type: new EnumTemplate(Subsampling, "YUV420"),
	},
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
