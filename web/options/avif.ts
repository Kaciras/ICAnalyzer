import { OptionTemplate } from "./index";
import { EnumTemplate, NumberRangeTemplate } from "../component/OptionTemplate";
import { WebpOptions } from "sharp";

export const name = "AVIF";
export const mimeType = "image/avif";
export const extension = "avif";

export const Subsampling = {
	YUV400: 0,
	YUV420: 1,
	YUV422: 2,
	YUV444: 3,
};

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

export function encode(data: ImageData, option2: WebpOptions): Promise<ArrayBuffer> {
	throw Error();
}
