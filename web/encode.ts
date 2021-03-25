import { Remote } from "comlink";
import type { WorkerApi } from "./worker";
import { ImageEncoder } from "./codecs";
import { decode } from "./decode";
import { WorkerPool } from "./WorkerPool";
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

export interface AnalyzeConfig {
	encoder: ImageEncoder;
	optionsList: any[];
	measure: MeasureOptions;
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
	private readonly config: AnalyzeConfig;

	private readonly pool: WorkerPool<WorkerApi>;

	constructor(image: ImageData, config: AnalyzeConfig) {
		const { measure, optionsList } = config;
		if (measure.workerCount < 1) {
			throw new Error("Thread count must be at least 1");
		}
		const concurrency = Math.min(measure.workerCount, optionsList.length);

		this.image = image;
		this.config = config;
		this.pool = new WorkerPool(newWorker, concurrency);
	}

	onProgress() {}

	private increaseProgress() {
		this.onProgress();
	}

	async encode(): Promise<ConvertOutput[]> {
		const { encoder, optionsList, measure } = this.config;
		const { image } = this;

		await this.pool.runOnEach(remote => remote.setImageToEncode(image));

		// Warmup workers to avoid disturbance of initialize time
		if (measure.time) {
			await this.pool.runOnEach(async remote => {
				await encoder.encode(optionsList[0], remote);
				this.increaseProgress();
			});
		}

		return this.pool.all(optionsList, this.poll.bind(this));
	}

	terminate() {
		this.pool.terminate();
	}

	private async poll(remote: Remote<WorkerApi>, options: any) {
		const { encoder } = this.config;

		const { buffer, time } = await encoder.encode(options, remote);
		const blob = new Blob([buffer], { type: encoder.mimeType });
		const data = await decode(blob);
		this.increaseProgress();

		const metrics = await this.measure(remote, data);
		return { time, buffer, data, metrics };
	}

	async measure(wrapper: Remote<WorkerApi>, data: ImageData) {
		const { SSIM, PSNR, butteraugli } = this.config.measure;
		const metrics: Metrics = {};

		if (PSNR) {
			metrics.PSNR = await wrapper.calcPSNR(data);
			this.increaseProgress();
		}
		if (SSIM.enabled) {
			metrics.SSIM = await wrapper.calcSSIM(data, SSIM.options);
			this.increaseProgress();
		}
		if (butteraugli.enabled) {
			const [source, raw] = await wrapper.calcButteraugli(data, butteraugli.options);
			this.increaseProgress();

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
