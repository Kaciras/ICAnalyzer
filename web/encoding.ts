import * as Comlink from "comlink";
import type { AVIFEncodeOptions } from "./worker/avif-encoder";
import type { WebPEncodeOptions } from "./worker/webp-encoder";
import type { EncodeWorker } from "./worker/utils";
import AVIFUrl from "worker-plugin/loader?esModule&name=avif!./worker/avif-encoder";
import WebPUrl from "worker-plugin/loader?esModule&name=webp!./worker/webp-encoder";

export class BatchEncoder<T> {

	private readonly url: string;

	private image?: ImageData;
	private optionsList!: T[];

	private index = 0;
	private workers: Worker[] = [];
	private results!: Uint8Array[];

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

		this.results = new Array<Uint8Array>(length);
		const tasks = new Array(threadCount);

		for (let i = 0; i < threadCount; i++) {
			const worker = new Worker(this.url);
			const wrapper = Comlink.wrap<EncodeWorker<T>>(worker);
			await wrapper.initialize(this.image);

			this.workers.push(worker);
			tasks.push(this.poll(wrapper));
		}

		return Promise.all(tasks).then(() => this.results);
	}

	stop() {
		this.workers.forEach(worker => worker.terminate());
	}

	private async poll(wrapper: Comlink.Remote<EncodeWorker<T>>) {
		const { results, optionsList } = this;

		while (this.index < optionsList.length) {
			const i = this.index++;
			this.onProgress(i);

			// @ts-ignore
			results[i] = await wrapper.encode(optionsList[i]);
		}
	}
}

export function createAVIFEncoder() {
	return new BatchEncoder<AVIFEncodeOptions>(AVIFUrl);
}

export function createWebPEncoder() {
	return new BatchEncoder<WebPEncodeOptions>(WebPUrl);
}
