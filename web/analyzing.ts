import { Remote } from "comlink";
import * as SSIM from "ssim.js";
import { ButteraugliOptions } from "../lib/diff";
import { ImageEncoder } from "./codecs";
import { decode } from "./decode";
import type { WorkerApi } from "./worker";
import { InputImage, MetricMeta } from "./app";
import WorkerPool, { TaskFn } from "./WorkerPool";

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
	butteraugli: Optional<ButteraugliOptions>;
}

interface EncodeOutput {
	time: number;
	buffer: ArrayBuffer;
	data: ImageData;
}

export interface AnalyzeResult {
	buffer: ArrayBuffer;
	data: ImageData;
	heatMap?: ImageData;
	metrics: Record<string, number>;
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

/**
 * Create a new object compatible with ImageData type from an ImageData,
 * with convert the data to SharedArrayBuffer.
 *
 * NOTE: the returned value is not an ImageData and can't be put into canvas.
 *
 * @param image original image data
 * @return the image data with shared
 */
export function share(image: ImageData): ImageData {
	const { width, height, data } = image;
	const buffer = new SharedArrayBuffer(data.byteLength);
	const uint8Array = new Uint8ClampedArray(buffer);
	uint8Array.set(data);
	return { width, height, data: uint8Array };
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

export function newWorker() {
	// @ts-ignore ts-loader will convert the file to ES module.
	return new Worker(new URL("./worker", import.meta.url));
}

export class Analyzer {

	private readonly pool: WorkerPool<WorkerApi>;
	private readonly measureOpts: MeasureOptions;

	constructor(pool: WorkerPool<WorkerApi>, measureOpts: MeasureOptions) {
		this.pool = pool;
		this.measureOpts = measureOpts;
	}

	onProgress() {}

	setOriginalImage(input: InputImage) {
		const { raw } = input;

		if ("SharedArrayBuffer" in window) {
			const shared = share(raw);
			return this.pool.runOnEach(r => r.setImageToEncode(shared));
		} else {
			return this.pool.runOnEach(r => r.setImageToEncode(raw));
		}
	}

	getMetricsMeta() {
		const { SSIM, PSNR, butteraugli } = this.measureOpts;
		let calculations = 0;
		const metricsMeta: MetricMeta[] = [];

		if (PSNR) {
			calculations++;
			metricsMeta.push({ key: "psnr", name: "PSNR (db)" });
		}
		if (SSIM.enabled) {
			calculations++;
			metricsMeta.push({ key: "ssim", name: "SSIM %" });
		}
		if (butteraugli.enabled) {
			calculations++;
			metricsMeta.push({ key: "butteraugli", name: "Butteraugli Score" });
		}

		return { calculations, metricsMeta };
	}

	async encode(remote: Remote<WorkerApi>, encoder: ImageEncoder, options: any) {
		const { buffer, time } = await encoder.encode(options, remote);
		this.onProgress();

		const blob = new Blob([buffer], { type: encoder.mimeType });
		return { time, buffer, data: await decode(blob, remote) } as EncodeOutput;
	}

	measure(output: AnalyzeResult) {
		const { pool, onProgress } = this;
		const { SSIM, PSNR, butteraugli } = this.measureOpts;
		const { data, metrics } = output;

		function queueTask(func: TaskFn<WorkerApi, any>) {
			pool.run(async remote => func(remote).then(onProgress));
		}

		if (butteraugli.enabled) {
			queueTask(async r => {
				const { score, heatMap } = await r.calcButteraugli(data, butteraugli.options);
				metrics.butteraugli = score;
				output.heatMap = rgbaToImage(heatMap, data.width, data.height);
			});
		}
		if (PSNR) {
			queueTask(async r => metrics.psnr = await r.calcPSNR(data));
		}
		if (SSIM.enabled) {
			queueTask(async r => metrics.ssim = await r.calcSSIM(data, SSIM.options) * 100);
		}
	}
}
