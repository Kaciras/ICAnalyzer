import { ImageWorker } from "../../features/image-worker";
import { BoolOption, EnumOption, NumberOption, OptionType } from "../../form/index.ts";
import OptionsGenerator from "../OptionsGenerator.tsx";
import { defaultOptions, EncodeOptions, Subsampling } from "./codec.ts";

export const name = "AVIF";
export const mimeType = "image/avif";
export const extension = "avif";

const AVIFTune = {
	Auto: 0,
	PSNR: 1,
	SSIM: 3,
};

const templates: OptionType[] = [
	new NumberOption({
		id: "cqLevel",
		label: "Quality (63 = lossless)",
		min: 0,
		max: 63,
		step: 1,
		mapFn: i => 63 - i,
		defaultValue: defaultOptions.cqLevel,
	}),
	new EnumOption({
		id: "subsample",
		label: "Subsample",
		enumObject: Subsampling,
		defaultValue: "YUV420",
	}),
	new NumberOption({
		id: "cqAlphaLevel",
		label: "Alpha quality (-1 to same with the quality)",
		min: -1,
		max: 63,
		step: 1,
		mapFn: i => (i === -1) ? -1 : 63 - i,
		defaultValue: defaultOptions.cqAlphaLevel,
	}),
	new BoolOption({
		id: "chromaDeltaQ",
		label: "Extra chroma compression",
		defaultValue: defaultOptions.chromaDeltaQ,
	}),
	new NumberOption({
		id: "sharpness",
		label: "Sharpness",
		min: 0,
		max: 7,
		step: 1,
		defaultValue: defaultOptions.sharpness,
	}),
	new NumberOption({
		id: "denoiseLevel",
		label: "Noise synthesis",
		min: 0,
		max: 50,
		step: 1,
		defaultValue: defaultOptions.denoiseLevel,
	}),
	new EnumOption({
		id: "tune",
		label: "Tuning",
		enumObject: AVIFTune,
		defaultValue: "Auto",
	}),
	new NumberOption({
		id: "tileRowsLog2",
		label: "Log2 of tile rows",
		min: 0,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.tileRowsLog2,
	}),
	new NumberOption({
		id: "tileColsLog2",
		label: "Log2 of tile cols",
		min: 0,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.tileColsLog2,
	}),
	new NumberOption({
		id: "speed",
		label: "Speed",
		min: 0,
		max: 10,
		step: 1,
		defaultValue: defaultOptions.speed,
	}),
];

export const optionsGenerator = new OptionsGenerator(templates, defaultOptions);

export function encode(options: EncodeOptions, worker: ImageWorker) {
	return worker.avifEncode(options);
}
