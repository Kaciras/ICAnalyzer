import * as Comlink from "comlink";
import WorkerUrl from "worker-plugin/loader?esModule&name=encoding!./worker";
import type { WorkerApi } from "./worker";
import { detectAVIFSupport, detectWebPSupport } from "./utils";
import { ButteraugliOptions } from "../lib/metrics";

export interface MeasureOptions {
	psnr: boolean;
	ssim: boolean;
	butteraugli: false | ButteraugliOptions;
}

export class BatchEncoder<T> {

	private readonly url: string;

	private image?: ImageData;
	private optionsList!: T[];
	private measure!: MeasureOptions;

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

	encode(image: ImageData, optionsList: T[], measure: MeasureOptions) {
		this.image = image;
		this.optionsList = optionsList;
		this.measure = measure;
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
		const { encoded, metrics, optionsList, measure } = this;

		while (this.index < optionsList.length) {
			const i = this.index++;
			this.onProgress(i);

			const buffer = await wrapper.webpEncode(optionsList[i]);
			encoded[i] = buffer;

			if (measure) {
				// const pixels = await decodeImage(new Blob([buffer], { type: "image/webp" }));
				const pixels = await wrapper.webpDecode(buffer);

				if (measure.psnr) {
					metrics[i] = await wrapper.calcPSNR(pixels);
				}
			}
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

type featureDetector = () => Promise<boolean>;
type DecodeFunction = (buffer: ArrayBuffer) => Promise<ImageData>;

function decodeFn(
	checkFn: featureDetector,
	native: DecodeFunction,
	polyfill: DecodeFunction,
) {
	let bestDecodeFn;

	return async function choose(buffer: ArrayBuffer) {
		if (await checkFn()) {
			bestDecodeFn = native;
		} else {
			bestDecodeFn = polyfill;
		}
		return await bestDecodeFn(buffer);
	};
}

export const decodeWebP = decodeFn(
	detectWebPSupport,
	decodeAVIFNative,
	decodeAVIFWorker);

function decodeAVIFNative(buffer: ArrayBuffer) {
	return decodeImage(new Blob([buffer], { type: "image/avif" }));
}

async function decodeAVIFWorker(buffer: ArrayBuffer) {
	const worker = Comlink.wrap<WorkerApi>(new Worker(WorkerUrl));
	return worker.avifDecode(buffer);
}

let decodeAVIF: (buffer: ArrayBuffer) => Promise<ImageData>;

decodeAVIF = async (buffer) => {
	if (await detectAVIFSupport()) {
		decodeAVIF = decodeAVIFNative;
	} else {
		decodeAVIF = decodeAVIFWorker;
	}
	return await decodeAVIF(buffer);
};
