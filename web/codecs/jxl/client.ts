import { ImageWorker } from "../../features/image-worker.ts";
import { BoolOption, NumberOption, OptionType } from "../../form/index.ts";
import OptionsGenerator from "../OptionsGenerator.tsx";
import { defaultOptions, EncodeOptions } from "./codec.ts";

export const name = "JPEG XL";
export const mimeType = "image/jxl";
export const extension = "jxl";

const templates: OptionType[] = [
	new NumberOption({
		id: "quality",
		label: "Quality (100 = lossless)",
		min: 0,
		max: 100,
		step: 0.1,
		defaultValue: defaultOptions.quality,
	}),
	new BoolOption({
		id: "lossyPalette",
		label: "Slight loss",
		defaultValue: defaultOptions.lossyPalette,
	}),
	new NumberOption({
		id: "epf",
		label: "Edge preserving filter (-1 = auto)",
		min: -1,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.epf,
	}),
	new NumberOption({
		id: "decodingSpeedTier",
		label: "Optimise for decoding speed",
		min: 0,
		max: 4,
		step: 1,
		defaultValue: defaultOptions.decodingSpeedTier,
	}),
	new NumberOption({
		id: "photonNoiseIso",
		label: "Noise equivalent to ISO",
		min: 0,
		max: 50000,
		step: 100,
		defaultValue: defaultOptions.photonNoiseIso,
	}),
	new BoolOption({
		id: "progressive",
		label: "Progressive",
		defaultValue: defaultOptions.progressive,
	}),
	new NumberOption({
		id: "effort",
		label: "Effort",
		min: 3,
		max: 9,
		step: 1,
		defaultValue: defaultOptions.effort,
	}),
];

export const optionsGenerator = new OptionsGenerator(templates, defaultOptions);

export function encode(options: EncodeOptions, worker: ImageWorker) {
	return worker.jxlEncode(options);
}
