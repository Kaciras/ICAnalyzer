import * as Comlink from "comlink";
import type { WorkerApi } from "./worker";
import { ImageEncoder } from "./codecs";
import { decode } from "./decode";

type WorkerFactory = () => Worker;

type RemoteTask<T, R> = (remote: Comlink.Remote<T>) => Promise<R>;

type TaskFn<T, A, R> = (remote: Comlink.Remote<T>, args: A) => Promise<R>;

export class WorkerPool {

	private readonly workers: Worker[] = [];
	private readonly remotes: Comlink.Remote<WorkerApi>[] = [];

	constructor(createWorker: WorkerFactory, count: number) {
		this.workers = new Array(count);
		this.remotes = new Array(count);

		for (let i = 0; i < count; i++) {
			const worker = createWorker();
			this.workers[i] = worker;
			this.remotes[i] = Comlink.wrap<WorkerApi>(worker);
		}
	}

	get count() {
		return this.workers.length;
	}

	/**
	 * Run a function with each worker.
	 *
	 * @param fn Function
	 */
	runOnEach<R>(fn: RemoteTask<WorkerApi, R>) {
		return Promise.all(this.remotes.map(fn));
	}

	async all<A, R>(args: A[], fn: TaskFn<WorkerApi, A, R>) {
		const returnValues = new Array(args.length);
		let index = 0;

		const allTasks = this.runOnEach(async remote => {
			while (index < args.length) {
				const i = index++;
				returnValues[i] = await fn(remote, args[i]);
			}
		});

		return allTasks.then(() => returnValues);
	}

	terminate() {
		this.workers.forEach(worker => worker.terminate());
	}
}

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
	private readonly pool: WorkerPool;

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

	private async poll(remote: Comlink.Remote<WorkerApi>, options: any) {
		const { encoder } = this.request;

		const { buffer, time } = await encoder.encode(options, remote);
		const blob = new Blob([buffer], { type: encoder.mimeType });
		const data = await decode(blob);
		const metrics = await this.measure(remote, data);

		this.increaseProgress();
		return { time, buffer, data, metrics };
	}

	async measure(wrapper: Comlink.Remote<WorkerApi>, data: ImageData) {
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

			const ctx = document.createElement("canvas").getContext("2d")!;
			const heatMap = ctx.createImageData(data.width, data.height);
			heatMap.data.set(new Uint8ClampedArray(raw));

			metrics.butteraugli = { source, heatMap };
		}

		return metrics;
	}
}
