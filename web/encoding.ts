import * as Comlink from "comlink";
import WorkerUrl from "worker-plugin/loader?esModule&name=worker!./worker";
import type { WorkerApi } from "./worker";

type WorkerFactory = () => Worker;

class WorkerPool<T> {

	private readonly newWorker: WorkerFactory;

	private readonly workers: Worker[];
	private readonly wrappers: Comlink.Remote<T>[];

	constructor(newWorker: WorkerFactory, workerCount = 4) {
		this.newWorker = newWorker;
		this.workers = new Array(workerCount);
		this.wrappers = new Array(workerCount);

		for (let i = 0; i < workerCount; i++) {
			const worker = newWorker();
			this.workers[i] = worker;
			this.wrappers[i] = Comlink.wrap(worker);
		}
	}

	require() {

	}
}

export class BatchEncoder<T> {

	private readonly url: string;

	private image?: ImageData;
	private optionsList!: T[];

	private index = 0;
	private workers: Worker[] = [];

	private encoded!: ArrayBuffer[];
	private metrics!: number[];

	constructor(url: string) {
		this.url = url;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onProgress(value: number) {
		// noop by default
	}

	encode(image: ImageData, optionsList: T[]) {
		this.image = image;
		this.optionsList = optionsList;
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

		this.encoded = new Array<ArrayBuffer>(length);
		this.metrics = new Array<number>(length);

		const tasks = new Array(threadCount);

		for (let i = 0; i < threadCount; i++) {
			const worker = new Worker(this.url);
			const wrapper = Comlink.wrap<WorkerApi>(worker);
			await wrapper.setImageToEncode(this.image);

			this.workers.push(worker);
			tasks.push(this.poll(wrapper));
		}

		return Promise.all(tasks).then(() => [this.encoded, this.metrics]);
	}

	stop() {
		this.workers.forEach(worker => worker.terminate());
	}

	private async poll(wrapper: Comlink.Remote<WorkerApi>) {
		const { encoded, metrics, optionsList } = this;

		while (this.index < optionsList.length) {
			const i = this.index++;
			this.onProgress(i);

			const buffer = await wrapper.webpEncode(optionsList[i]);
			encoded[i] = buffer;
			const pixels = await decodeImage(new Blob([buffer], { type: "image/webp" }));
			metrics[i] = await wrapper.calcPSNR(pixels);
		}
	}
}

export function createWorkers() {
	return new BatchEncoder(WorkerUrl);
}

async function decodeImage(blob: Blob) {
	const bitmap = await createImageBitmap(blob);

	const canvas = document.createElement("canvas");
	const { width, height } = bitmap;
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d")!;
	ctx.drawImage(bitmap, 0, 0);
	return ctx.getImageData(0, 0, width, height);
}

function decodeAVIFNative(buffer: ArrayBuffer) {
	return decodeImage(new Blob([buffer], { type: "image/avif" }));
}

async function decodeAVIFWorker(buffer: ArrayBuffer) {
	const worker = Comlink.wrap<WorkerApi>(new Worker(WorkerUrl));
	return worker.avifDecode(buffer);
}

// let decodeAVIF = async (buffer: ArrayBuffer) => {
// 	if (await detectAVIFSupport()) {
// 		decodeAVIF = decodeAVIFNative;
// 	} else {
// 		decodeAVIF = decodeAVIFWorker;
// 	}
// 	return decodeAVIF(buffer);
// };
