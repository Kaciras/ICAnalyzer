import type { EncodeOptions } from "squoosh/codecs/avif/enc/avif_enc";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import { wasmDecodeFn, wasmEncodeFn } from "../common";

export { EncodeOptions };

export const Subsampling = {
	YUV400: 0,
	YUV420: 1,
	YUV422: 2,
	YUV444: 3,
};

export const AVIFTune = {
	auto: 0,
	psnr: 1,
	ssim: 3,
};

export const defaultOptions: EncodeOptions = {
	cqLevel: 33,
	cqAlphaLevel: -1,
	denoiseLevel: 0,
	tileColsLog2: 0,
	tileRowsLog2: 0,
	speed: 6,
	subsample: Subsampling.YUV420,
	chromaDeltaQ: false,
	sharpness: 0,
	tune: AVIFTune.auto,
};

export const encode = wasmEncodeFn<EncodeOptions>(async () => {
	const module = await import("squoosh/codecs/avif/enc/avif_enc");
	return initEmscriptenModule(module.default);
});

export const decode = wasmDecodeFn(async () => {
	const module = await import("squoosh/codecs/avif/dec/avif_dec");
	return initEmscriptenModule(module.default);
});
