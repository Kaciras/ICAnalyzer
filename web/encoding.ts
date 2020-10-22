import * as Comlink from "comlink";
import { Remote } from "comlink";
import WorkerUrl from "worker-plugin/loader?esModule&name=encoding!./worker";
import type { WorkerApi } from "./worker";
import { ButteraugliOptions } from "../lib/metrics";
import { Drawable } from "./decode";
import { Encoder, EncoderFactory } from "./options";

type WorkerFn<T> = (remote: Remote<WorkerApi>) => T;

class WorkerPool {

	private readonly workers: Worker[] = [];
	private readonly remotes: Remote<WorkerApi>[] = [];

	private readonly count: number;

	constructor(count: number) {
		const worker = new Worker(WorkerUrl);
		this.count = count;
		this.workers.push(worker);
		this.remotes.push(Comlink.wrap<WorkerApi>(worker));
	}

	require<T>(func: WorkerFn<T>) {

	}
}

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
	buffer: ArrayBuffer;
	metrics: Metrics;
	bitmap: Drawable;
}

export class BatchEncoder<T> {

	private readonly createEncoder: EncoderFactory;

	private image?: ImageData;
	private optionsList!: T[];
	private measureOptions!: MeasureOptions;

	private encoders: Encoder[] = [];
	private index = 0;

	private results!: ConvertOutput[];

	constructor(createEncoder: EncoderFactory) {
		this.createEncoder = createEncoder;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onProgress(value: number) {
		// noop by default
	}

	encode(image: ImageData, optionsList: T[], measure: MeasureOptions) {
		this.image = image;
		this.optionsList = optionsList;
		this.measureOptions = measure;
		return this;
	}

	async start(threadCount = 4) {
		if (!this.image) {
			throw new Error("You should call encode() before start.");
		}
		if (threadCount < 1) {
			throw new Error("Thread count must be at least 1");
		}

		const length = this.optionsList.length;
		threadCount = Math.min(threadCount, length);

		this.results = new Array<ConvertOutput>(length);

		const tasks = new Array(threadCount);

		for (let i = 0; i < threadCount; i++) {
			const encoder = this.createEncoder();
			await encoder.setImage(this.image);

			this.encoders.push(encoder);
			tasks.push(this.poll(encoder));
		}

		return Promise.all(tasks).then(() => this.results);
	}

	stop() {
		this.workers.forEach(worker => worker.terminate());
	}

	private async poll(encoder: Encoder) {
		const { results, optionsList } = this;

		while (this.index < optionsList.length) {
			const i = this.index++;
			this.onProgress(i);

			const { buffer, data, bitmap } = await encoder.encode(optionsList[i]);
			const metrics = await this.measure(wrapper, data);
			results[i] = { buffer, bitmap, metrics };
		}
	}

	async measure(wrapper: Comlink.Remote<WorkerApi>, data: ImageData) {
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

export function createWorkers() {
	return new BatchEncoder(WorkerUrl);
}
