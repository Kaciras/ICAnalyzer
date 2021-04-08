import { Remote } from "comlink";
import type { WorkerApi } from "./worker";
import { ImageEncoder } from "./codecs";
import { decode } from "./decode";
import * as SSIM from "ssim.js";

export interface ButteraugliConfig {
	hfAsymmetry: number;
	goodQualitySeek: number;
	badQualitySeek: number;
}

export interface Optional<T> {
	options: T;
	enabled: boolean;
}

export interface MeasureOptions {
	version: number;
	workerCount: number;
	time: boolean;
	PSNR: boolean;
	SSIM: Optional<SSIM.Options>;
	butteraugli: Optional<ButteraugliConfig>;
}

export interface Metrics {
	SSIM?: number;
	PSNR?: number;
	butteraugli?: {
		source: number;
		heatMap: ImageData;
	};
}

export interface ConvertOutput {
	time: number;
	buffer: ArrayBuffer;
	data: ImageData;
	metrics: Metrics;
}

// JSON.stringify is not deterministic, be careful with the properties order.
export class ObjectKeyMap<K, V> {

	private readonly table: Record<string, V> = {};

	get(key: K) {
		return this.table[JSON.stringify(key)];
	}

	set(key: K, value: V) {
		this.table[JSON.stringify(key)] = value;
	}
}

export function newWorker() {
	// @ts-ignore ts-loader will convert the file to ES module.
	return new Worker(new URL("./worker", import.meta.url));
}

export class BatchEncodeAnalyzer {

	onProgress() {}

	async encode(remote: Remote<WorkerApi>, encoder: ImageEncoder, options: any) {
		const { buffer, time } = await encoder.encode(options, remote);
		this.onProgress();

		const blob = new Blob([buffer], { type: encoder.mimeType });
		return { time, buffer, data: await decode(blob, remote) };
	}

	async measure(remote: Remote<WorkerApi>, data: ImageData, options: MeasureOptions) {
		const { SSIM, PSNR, butteraugli } = options;
		const metrics: Metrics = {};

		if (PSNR) {
			metrics.PSNR = await remote.calcPSNR(data);
			this.onProgress();
		}
		if (SSIM.enabled) {
			metrics.SSIM = await remote.calcSSIM(data, SSIM.options);
			this.onProgress();
		}
		if (butteraugli.enabled) {
			const [source, raw] = await remote.calcButteraugli(data, butteraugli.options);
			this.onProgress();

			const heatMap = rgbaToImage(raw, data.width, data.height);
			metrics.butteraugli = { source, heatMap };
		}

		return metrics;
	}
}

function rgbaToImage(buffer: ArrayBufferLike, width: number, height: number) {
	const channels = buffer.byteLength / width / height;
	if (channels !== 4) {
		throw new Error("Buffer must be a 8-bit depth RGBA array");
	}
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("Could not create canvas context");
	}
	const imageData = ctx.createImageData(width, height);
	imageData.data.set(new Uint8ClampedArray(buffer));
	return imageData;
}
