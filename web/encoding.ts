import * as Comlink from "comlink";
import { Remote } from "comlink";
import { ButteraugliOptions } from "../lib/metrics";
import type { WorkerApi } from "./worker";
import { ImageEncoder } from "./options";
import { decode, Drawable } from "./decode";

export interface MeasureOptions {
	PSNR: boolean;
	SSIM: boolean;
	butteraugli: false | ButteraugliOptions;
}

interface Metrics {
	SSIM?: number;
	PSNR?: number;
	butteraugli?: {
		source: number;
		heatMap: Drawable;
	};
}

export interface ConvertOutput {
	time: number;
	buffer: ArrayBuffer;
	bitmap: Drawable;
	metrics: Metrics;
}

export class BatchEncoder<T> {

	private readonly count: number;
	private readonly encoder: ImageEncoder;

	private image!: ImageData;
	private optionsList!: T[];
	private measureOptions!: MeasureOptions;

	private workers: Worker[] = [];

	private index = 0;
	private results!: ConvertOutput[];

	constructor(workerCount: number, encoder: ImageEncoder) {
		if (workerCount < 1) {
			throw new Error("Thread count must be at least 1");
		}
		this.count = workerCount;
		this.encoder = encoder;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onProgress(value: number) {}

	async encode(image: ImageData, optionsList: T[], measure: MeasureOptions) {
		this.image = image;
		this.optionsList = optionsList;
		this.measureOptions = measure;

		const length = optionsList.length;

		this.results = new Array<ConvertOutput>(length);
		const tasks = new Array(this.workers.length);

		this.workers = [];

		for (let i = 0; i < this.count; i++) {
			// @ts-ignore ts-loader converts files into ES module.
			const worker = new Worker(new URL("./worker", import.meta.url));
			const remote = Comlink.wrap<WorkerApi>(worker);
			await remote.setImageToEncode(image);

			this.workers.push(worker);
			tasks.push(this.poll(remote));
		}

		return Promise.all(tasks).then(() => this.results);
	}

	stop() {
		this.workers.forEach(worker => worker.terminate());
	}

	private async poll(remote: Remote<WorkerApi>) {
		const { results, optionsList, encoder } = this;

		while (this.index < optionsList.length) {
			const i = this.index++;
			this.onProgress(i);

			const { buffer, time } = await encoder.encode(optionsList[i], remote);
			const blob = new Blob([buffer], { type: encoder.mimeType });
			const [data, bitmap] = await decode(blob);

			const metrics = await this.measure(remote, data);
			results[i] = { time, buffer, bitmap, metrics };
		}
	}

	async measure(wrapper: Remote<WorkerApi>, data: ImageData) {
		const { SSIM, PSNR, butteraugli } = this.measureOptions;
		const metrics: Metrics = {};

		if (PSNR) {
			metrics.PSNR = await wrapper.calcPSNR(data);
		}
		if (SSIM) {
			metrics.SSIM = await wrapper.calcSSIM(data);
		}
		if (butteraugli) {
			const [source, raw] = await wrapper.calcButteraugli(data);

			const ctx = document.createElement("canvas").getContext("2d")!;
			const d = ctx.createImageData(data.width, data.height);

			if (raw.byteLength / d.width / d.height === 4) {
				d.data.set(new Uint8ClampedArray(raw));
			} else {
				d.data.set(new Uint8ClampedArray(padAlpha(raw)));
			}

			metrics.butteraugli = { source, heatMap: await createImageBitmap(d) };
		}

		return metrics;
	}
}

function padAlpha(input: ArrayBuffer) {
	const length = input.byteLength / 3;
	const rgb = new Uint8Array(input);
	const rgba = new Uint32Array(length);

	for (let j = 0, k = 0; j < length; j++, k += 3) {
		rgba[j] = (rgb[k] << 24) + (rgb[k + 1] << 16) + (rgb[k + 2] << 8) + 255;
	}
	return rgba.buffer;
}
