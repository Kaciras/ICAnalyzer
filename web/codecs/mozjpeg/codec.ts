import type { EncodeOptions } from "squoosh/codecs/mozjpeg/enc/mozjpeg_enc.js";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils/index.ts";
import { wasmEncodeFn } from "../common.ts";

export { EncodeOptions };

export const ColorSpace = {
	GRAYSCALE: 1,
	RGB: 2,
	YCbCr: 3,
};

export const Quantization = {
	"JPEG Annex K": 0,
	"Flat": 1,
	"MSSIM-tuned Kodak": 2,
	"ImageMagick": 3,
	"PSNR-HVS-M-tuned Kodak": 4,
	"Klein et al": 5,
	"Watson et al": 6,
	"Ahumada et al": 7,
	"Peterson et al": 8,
};

export const defaultOptions: EncodeOptions = {
	quality: 75,
	baseline: false,
	arithmetic: false,
	progressive: true,
	optimize_coding: true,
	smoothing: 0,
	color_space: ColorSpace.YCbCr,
	quant_table: Quantization.ImageMagick,
	trellis_multipass: false,
	trellis_opt_zero: false,
	trellis_opt_table: false,
	trellis_loops: 1,
	auto_subsample: true,
	chroma_subsample: 2,
	separate_chroma_quality: false,
	chroma_quality: 75,
};

export const encode = wasmEncodeFn<EncodeOptions>(async () => {
	const module = await import("squoosh/codecs/mozjpeg/enc/mozjpeg_enc");
	return initEmscriptenModule(module.default);
});
