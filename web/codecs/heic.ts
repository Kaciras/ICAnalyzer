import { heic } from "icodec";
import { ImageWorker } from "../features/image-worker.ts";
import { BoolOption, EnumOption, NumberOption, OptionType } from "../form/index.ts";

export const name = "HEIC";
export const mimeType = heic.mimeType;
export const extension = heic.extension;

export const defaultOptions = heic.defaultOptions;

export const templates: OptionType[] = [
	new BoolOption({
		id: "lossless",
		label: "Lossless",
		defaultValue: defaultOptions.lossless,
	}),
	new NumberOption({
		id: "quality",
		label: "Quality",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.quality,
	}),
	new NumberOption({
		id: "complexity",
		label: "Complexity",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.complexity,
	}),
	new EnumOption({
		id: "preset",
		label: "Preset",
		names: heic.Presets,
		defaultValue: defaultOptions.preset,
	}),
	new EnumOption({
		id: "tune",
		label: "Tune",
		names: ["psnr" , "ssim" , "grain" , "fastdecode"],
		defaultValue: defaultOptions.tune,
	}),
	new NumberOption({
		id: "tuIntraDepth",
		label: "Max TU recursive depth",
		min: 1,
		max: 4,
		step: 1,
		defaultValue: defaultOptions.tuIntraDepth,
	}),
	new EnumOption({
		id: "chroma",
		label: "Chroma Subsampling",
		names: heic.Subsampling,
		defaultValue: defaultOptions.chroma,
	}),
	new BoolOption({
		id: "sharpYUV",
		label: "Use SharpYUV Downsampling",
		defaultValue: defaultOptions.sharpYUV,
	}),
];

export function encode(options: heic.Options, worker: ImageWorker) {
	return worker.heicEncode(options);
}
