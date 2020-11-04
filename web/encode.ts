import { Remote } from "comlink";
import type { WorkerApi } from "./worker";
import { ImageEncoder } from "./codecs";
import { decode } from "./decode";
import { WorkerPool } from "./WorkerPool";

export interface ButteraugliConfig {
	hfAsymmetry: number;
	goodQualitySeek: number;
	badQualitySeek: number;
}

export interface MeasureOptions {
	time: boolean;
	PSNR: boolean;
	SSIM: boolean;
	butteraugli: false | ButteraugliConfig;
}

export interface EncodeRequest {
	encoder: ImageEncoder;
	image: ImageData;
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

	private readonly request: EncodeRequest;
	private readonly pool: WorkerPool<WorkerApi>;

	private progress = 0;
	private progressMax = 0;

	constructor(workerCount: number, request: EncodeRequest) {
		if (workerCount < 1) {
			throw new Error("Thread count must be at least 1");
		}
		this.request = request;

		const concurrency = Math.min(workerCount, this.request.optionsList.length);
		this.pool = new WorkerPool(newWorker, concurrency);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onProgress(value: number, max: number) {}

	private increaseProgress() {
		this.onProgress(this.progress++, this.progressMax);
	}

	async encode() {
		const { image, encoder, optionsList, measure } = this.request;
		this.progressMax = optionsList.length;

		await this.pool.runOnEach(remote => remote.setImageToEncode(image));

		// Warmup workers to avoid disturbance of initialize time
		if (measure.time) {
			this.progressMax += this.pool.count;

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
		const { encoder } = this.request;

		const { buffer, time } = await encoder.encode(options, remote);
		const blob = new Blob([buffer], { type: encoder.mimeType });
		const data = await decode(blob);
		const metrics = await this.measure(remote, data);

		this.increaseProgress();
		return { time, buffer, data, metrics };
	}

	async measure(wrapper: Remote<WorkerApi>, data: ImageData) {
		const { SSIM, PSNR, butteraugli } = this.request.measure;
		const metrics: Metrics = {};

		if (PSNR) {
			metrics.PSNR = await wrapper.calcPSNR(data);
		}
		if (SSIM) {
			metrics.SSIM = await wrapper.calcSSIM(data);
		}
		if (butteraugli) {
			const options = { ...butteraugli, ensureAlpha: true };
			const [source, raw] = await wrapper.calcButteraugli(data, options);
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
