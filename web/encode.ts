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

export interface MeasureOptions {
	time: boolean;
	PSNR: boolean;
	SSIM: false | SSIMOptions;
	butteraugli: false | ButteraugliConfig;
}

export interface AnalyzeConfig {
	encoder: ImageEncoder;
	threads: number;
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
	// @ts-ignore ts-loader will convert files to ES module.
	return new Worker(new URL("./worker", import.meta.url));
}

export class BatchEncoder {

	readonly progressMax: number;

	private readonly image: ImageData;
	private readonly config: AnalyzeConfig;

	private readonly pool: WorkerPool<WorkerApi>;

	private progress = 0;

	constructor(image: ImageData, config: AnalyzeConfig) {
		const { threads, optionsList } = config;
		if (threads < 1) {
			throw new Error("Thread count must be at least 1");
		}
		const concurrency = Math.min(threads, optionsList.length);

		this.image = image;
		this.config = config;
		this.pool = new WorkerPool(newWorker, concurrency);
		this.progressMax = this.getProgressMax();
	}

	private getProgressMax() {
		const { optionsList, measure } = this.config;

		let calculations = 1;
		if (measure.butteraugli) calculations++;
		if (measure.SSIM) calculations++;
		if (measure.PSNR) calculations++;

		const value = optionsList.length * calculations;
		return measure.time ? value + this.pool.count : value;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onProgress(value: number) {}

	private increaseProgress() {
		this.onProgress(this.progress++);
	}

	async encode() {
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
		if (SSIM) {
			metrics.SSIM = await wrapper.calcSSIM(data, SSIM);
			this.increaseProgress();
		}
		if (butteraugli) {
			const [source, raw] = await wrapper.calcButteraugli(data, butteraugli);
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
