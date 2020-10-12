import { OptionTemplate } from "./index";
import { NumberRangeTemplate } from "../component/OptionTemplate";

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
