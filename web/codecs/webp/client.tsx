import { ImageWorker } from "../../features/image-worker";
import { BoolOption, EnumOption, NumberOption, OptionType } from "../../form";
import OptionsGenerator from "../OptionsGenerator";
import { defaultOptions, EncodeOptions } from "./codec";

export const name = "WebP";
export const mimeType = "image/webp";
export const extension = "webp";

const Preprocess = {
	"None": 0,
	"Segment smooth": 1,
	"Dithering": 2,
};

// https://github.com/webmproject/libwebp/blob/df0e808fed22aa8b09f20c613fcfdc6c8c9c8c8b/src/enc/config_enc.c#L144
const losslessPresets = [
	{ method: 0, quality: 0 },
	{ method: 1, quality: 20 },
	{ method: 2, quality: 25 },
	{ method: 3, quality: 30 },
	{ method: 3, quality: 50 },
	{ method: 4, quality: 50 },
	{ method: 4, quality: 75 },
	{ method: 4, quality: 90 },
	{ method: 5, quality: 90 },
	{ method: 6, quality: 100 },
];

class LosslessPresetOption extends NumberOption {

	populate(value: number, options: EncodeOptions) {
		if (!options.lossless) {
			return;
		}
		Object.assign(options, losslessPresets[value]);
	}
}

const templates: OptionType[] = [
	new BoolOption({
		id: "lossless",
		label: "Lossless Mode (-lossless)",
		defaultValue: defaultOptions.lossless,
	}),
	new NumberOption({
		id: "method",
		label: "Method (-m)",
		min: 0,
		max: 6,
		step: 1,
		defaultValue: defaultOptions.method,
	}),
	new NumberOption({
		id: "quality",
		label: "Quality (-q)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.quality,
	}),
	new NumberOption({
		id: "near_lossless",
		label: "Near lossless (-near_lossless)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.near_lossless,
	}),
	new BoolOption({
		id: "autofilter",
		label: "Auto adjust filter strength (-af)",
		defaultValue: defaultOptions.autofilter,
	}),
	new NumberOption({
		id: "filter_strength",
		label: "Filter strength (-f)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.filter_strength,
	}),
	new BoolOption({
		id: "filter_type",
		label: "User strong filter (-strong)",
		defaultValue: defaultOptions.filter_type,
	}),
	new NumberOption({
		id: "filter_sharpness",
		label: "Filter sharpness (-sharpness)",
		min: 0,
		max: 7,
		step: 1,
		defaultValue: defaultOptions.filter_sharpness,
	}),
	new BoolOption({
		id: "use_sharp_yuv",
		label: "Sharp YUV (-sharp_yuv)",
		defaultValue: defaultOptions.use_sharp_yuv,
	}),
	new NumberOption({
		id: "pass",
		label: "Passes (-pass)",
		min: 1,
		max: 10,
		step: 1,
		defaultValue: defaultOptions.pass,
	}),
	new NumberOption({
		id: "sns_strength",
		label: "Spatial noise shaping (-sns)",
		min: 0,
		max: 100,
		step: 1,
		defaultValue: defaultOptions.sns_strength,
	}),
	new EnumOption({
		id: "preprocessing",
		label: "Preprocess (-pre)",
		enumObject: Preprocess,
		defaultValue: "None",
	}),
	new NumberOption({
		id: "segments",
		label: "Segments (-segments)",
		min: 1,
		max: 4,
		step: 1,
		defaultValue: defaultOptions.segments,
	}),
	new LosslessPresetOption({
		id: "losslessPreset",
		label: "Lossless Preset (-z)",
		min: 0,
		max: 9,
		step: 1,
		defaultValue: 6,
	}),

	// There is no image_hint option since it have no effect.
];

export const optionsGenerator = new OptionsGenerator(templates, defaultOptions);

export function encode(options: EncodeOptions, worker: ImageWorker) {
	return worker.webpEncode(options);
}
