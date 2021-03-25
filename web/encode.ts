import { Remote } from "comlink";
import type { WorkerApi } from "./worker";
import { ImageEncoder } from "./codecs";
import { decode } from "./decode";
import WorkerPool from "./WorkerPool";
import { SSIMOptions } from "../lib/similarity";

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
	SSIM: Optional<SSIMOptions>;
	butteraugli: Optional<ButteraugliConfig>;
}

interface Metrics {
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

export function newWorker() {
	// @ts-ignore ts-loader will convert the file to ES module.
	return new Worker(new URL("./worker", import.meta.url));
}

export class BatchEncodeAnalyzer {

	private readonly image: ImageData;
	private readonly measureOptions: MeasureOptions;

	readonly pool: WorkerPool<WorkerApi>;

	constructor(image: ImageData, measure: MeasureOptions) {
		this.image = image;
		this.measureOptions = measure;
		this.pool = new WorkerPool(newWorker, measure.workerCount);
	}

	onProgress() {}

	async initialize() {
		await this.pool.runOnEach(remote => remote.setImageToEncode(this.image));
	}

	encode(encoder: ImageEncoder, options: any) {
		return this.pool.run(remote => this.poll(remote, encoder, options));
	}

	terminate() {
		this.pool.terminate();
	}

	private async poll(remote: Remote<WorkerApi>, encoder: ImageEncoder, options: any) {
		const { buffer, time } = await encoder.encode(options, remote);
		const blob = new Blob([buffer], { type: encoder.mimeType });
		const data = await decode(blob, remote);
		this.onProgress();

		const metrics = await this.measure(remote, data);
		return { time, buffer, data, metrics } as ConvertOutput;
	}

	async measure(wrapper: Remote<WorkerApi>, data: ImageData) {
		const { SSIM, PSNR, butteraugli } = this.measureOptions;
		const metrics: Metrics = {};

		if (PSNR) {
			metrics.PSNR = await wrapper.calcPSNR(data);
			this.onProgress();
		}
		if (SSIM.enabled) {
			metrics.SSIM = await wrapper.calcSSIM(data, SSIM.options);
			this.onProgress();
		}
		if (butteraugli.enabled) {
			const [source, raw] = await wrapper.calcButteraugli(data, butteraugli.options);
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
