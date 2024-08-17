import { png } from "icodec";
import { BoolOption, NumberOption, OptionType } from "../form/index.ts";
import { ImageWorker } from "../features/image-worker.ts";

export const name = "PNGQuant";
export const mimeType = png.mimeType;
export const extension = png.extension;

export const defaultOptions = png.defaultOptions;

export const templates: OptionType[] = [
	new BoolOption({
		id: "quantize",
		label: "Enable Quantization (lossy)",
		defaultValue: defaultOptions.quantize,
	}),
	new NumberOption({
		id: "quality",
		label: "Quantization Quality",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.quality,
	}),
	new NumberOption({
		id: "speed",
		label: "Quantization Speed",
		min: 1,
		max: 10,
		step: 1,
		defaultValue: defaultOptions.speed,
	}),
	new NumberOption({
		id: "colors",
		label: "Max Colors",
		min: 2,
		max: 256,
		step: 1,
		defaultValue: defaultOptions.colors,
	}),
	new NumberOption({
		id: "dithering",
		label: "Dithering",
		min: 0,
		max: 1,
		step: 0.1,
		defaultValue: defaultOptions.dithering,
	}),
	new NumberOption({
		id: "level",
		label: "Compress Level",
		min: 0,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.level,
	}),
	new BoolOption({
		id: "interlace",
		label: "Interlace",
		defaultValue: defaultOptions.interlace,
	}),
];

export function encode(options: png.Options, worker: ImageWorker) {
	return worker.pngEncode(options);
}
