import { Remote } from "comlink";
import { NumberRangeTemplate } from "../component/OptionTemplate";
import { WorkerApi } from "../worker";
import { OptionTemplate } from "./index";

export const name = "WebP";
export const mimeType = "image/webp";
export const extension = "webp";

export function encode(options: any, worker: Remote<WorkerApi>) {
	return worker.webpEncode(options);
}

export const optionTemplate: OptionTemplate[] = [
	{
		label: "Quality (-q)",
		name: "quality",
		type: new NumberRangeTemplate(0, 100, 75),
		defaultVariable: true,
	},
	{
		label: "Method (-m)",
		name: "method",
		type: new NumberRangeTemplate(0, 6, 4),
	},
	{
		label: "Spatial noise shaping (-sns)",
		name: "sns",
		type: new NumberRangeTemplate(0, 6, 4),
	},
	{
		label: "Filter sharpness (-f)",
		name: "filter_sharpness",
		type: new NumberRangeTemplate(0, 100, 4),
	},
];
