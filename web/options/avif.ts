import { OptionTemplate } from "./index";
import { EnumTemplate, NumberRangeTemplate } from "../component/OptionTemplate";

export const AVIFOptionsTemplate: OptionTemplate[] = [
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
		type: new EnumTemplate(0, 8, 6),
	},
];
