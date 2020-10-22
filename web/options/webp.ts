import { OptionTemplate, WorkerEncoder } from "./index";
import { NumberRangeTemplate } from "../component/OptionTemplate";

export const name= "WebP";
export const mimeType = "image/webp";
export const extension = "webp";

export class WebPEncoder extends WorkerEncoder {

	async encode(options: any) {
		const buffer = await this.remote.webpEncode(options);

	}
}

export const WebPOptionsTemplate: OptionTemplate[] = [
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
