export enum WebPImageHint {
	WEBP_HINT_DEFAULT, // default preset.
	WEBP_HINT_PICTURE, // digital picture, like portrait, inner shot
	WEBP_HINT_PHOTO,   // outdoor photograph, with natural lighting
	WEBP_HINT_GRAPH,   // Discrete tone image (graph, map-tile etc).
}

export interface WebPEncodeOptions {
	quality: number;
	target_size: number;
	target_PSNR: number;
	method: number;
	sns_strength: number;
	filter_strength: number;
	filter_sharpness: number;
	filter_type: number;
	partitions: number;
	segments: number;
	pass: number;
	show_compressed: number;
	preprocessing: number;
	autofilter: number;
	partition_limit: number;
	alpha_compression: number;
	alpha_filtering: number;
	alpha_quality: number;
	lossless: number;
	exact: number;
	image_hint: WebPImageHint;
	emulate_jpeg_size: number;
	thread_level: number;
	low_memory: number;
	near_lossless: number;
	use_delta_palette: number;
	use_sharp_yuv: number;
}

interface WebPModule extends EmscriptenModule {
	encode(data: BufferSource, width: number, height: number, options: WebPEncodeOptions): Uint8Array | null;
}

export default function (opts: Partial<EmscriptenModule>): Promise<WebPModule>;
