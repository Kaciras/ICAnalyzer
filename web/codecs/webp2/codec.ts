import type { EncodeOptions } from "squoosh/codecs/wp2/enc/wp2_enc";
import { initEmscriptenModule } from "squoosh/src/features/worker-utils";
import { wasmDecodeFn, wasmEncodeFn } from "../common";

export { EncodeOptions };

export const UVMode = {
	"Adapt": 0,
	"420": 1,
	"444": 2,
	"Auto": 3,
};

export const Csp = {
	YCoCg: 0,
	YCbCr: 1,
	Custom: 2,
	YIQ: 3,
};

export const defaultOptions: EncodeOptions = {
	quality: 75,
	alpha_quality: 75,
	effort: 5,
	pass: 1,
	sns: 50,
	uv_mode: UVMode.Adapt,
	csp_type: Csp.YCoCg,
	error_diffusion: 0,
	use_random_matrix: false,
};

export const encode = wasmEncodeFn<EncodeOptions>(async () => {
	const module = await import("squoosh/codecs/wp2/enc/wp2_enc");
	return initEmscriptenModule(module.default);
});

export const decode = wasmDecodeFn(async () => {
	const module = await import("squoosh/codecs/wp2/dec/wp2_dec");
	return initEmscriptenModule(module.default);
});
