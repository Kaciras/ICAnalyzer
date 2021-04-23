import { Remote } from "comlink";
import type { WorkerApi } from "./worker";
import { ImageEncoder } from "./codecs";
import { decode } from "./decode";
import * as SSIM from "ssim.js";
import { FullButteraugliOptions } from "../lib/diff";
import { MetricMeta } from "./app/ChartPanel";
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
	butteraugli: Optional<FullButteraugliOptions>;
}

export interface InternalMetrics {
	time: number;
	ratio: number;
	SSIM?: number;
	PSNR?: number;
	butteraugli?: number;
}

interface EncodeResult {
	time: number;
	buffer: ArrayBuffer;
	data: ImageData;
}

export interface ConvertOutput {
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

export function newWorker() {
	// @ts-ignore ts-loader will convert the file to ES module.
	return new Worker(new URL("./worker", import.meta.url));
}

export function getMetricsMeta(options: MeasureOptions) {
	let calculations = 0;
	const metricsMeta: MetricMeta[] = [
		// { key: "ratio", name: "Compression Ratio %" },
	];

	// if (options.time) {
	// 	series.push({ key: "time", name: "Encode Time (s)" });
	// }

	if (options.PSNR) {
		calculations++;
		metricsMeta.push({ key: "psnr", name: "PSNR (db)" });
	}
	if (options.SSIM.enabled) {
		calculations++;
		metricsMeta.push({ key: "ssim", name: "SSIM %" });
	}
	if (options.butteraugli.enabled) {
		calculations++;
		metricsMeta.push({ key: "butteraugli", name: "Butteraugli Score" });
	}

	return { calculations, metricsMeta };
}

export function measureFor(pool: WorkerPool<WorkerApi>, options: MeasureOptions, onProgress: () => void) {
	const { SSIM, PSNR, butteraugli } = options;

	function queueTask(func: TaskFn<WorkerApi, any>) {
		pool.run(async remote => func(remote).then(onProgress));
	}

	return (output: ConvertOutput) => {
		const { data, metrics }= output;

		if (butteraugli.enabled) {
			queueTask(async r => {
				const [source, raw] = await r.calcButteraugli(data, butteraugli.options);
				metrics.butteraugli = source;
				output.heatMap = rgbaToImage(raw, data.width, data.height);
			});
		}
		if (PSNR) {
			queueTask(async r => metrics.psnr = await r.calcPSNR(data));
		}
		if (SSIM.enabled) {
			queueTask(async r => metrics.ssim = await r.calcSSIM(data, SSIM.options) * 100);
		}
	};
}

export class BatchEncodeAnalyzer {

	onProgress() {}

	async encode(remote: Remote<WorkerApi>, encoder: ImageEncoder, options: any) {
		const { buffer, time } = await encoder.encode(options, remote);
		this.onProgress();

		const blob = new Blob([buffer], { type: encoder.mimeType });
		return { time, buffer, data: await decode(blob, remote) } as EncodeResult;
	}

	async measure(remote: Remote<WorkerApi>, result: EncodeResult, options: MeasureOptions) {
		const { time, buffer, data } = result;
		const { SSIM, PSNR, butteraugli } = options;

		const metrics: InternalMetrics = { time };
		let heatMap: ImageData | undefined = undefined;

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

			heatMap = rgbaToImage(raw, data.width, data.height);
			metrics.butteraugli = source;
		}

		return { buffer, data, heatMap, metrics };
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
