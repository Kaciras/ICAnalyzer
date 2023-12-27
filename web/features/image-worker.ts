import type { ImageWorkerApi } from "./worker.ts";
import { noop, RPC } from "@kaciras/utilities/browser";
import WorkerPool from "./WorkerPool.ts";

export interface InputImage {
	readonly file: File;
	readonly raw: ImageData;
}

export interface AnalyzeResult {
	data: ImageData;
	file: File;
	heatMap?: ImageData;
	metrics: Record<string, number>;
}

/**
 * Create a new object compatible with ImageData type from an ImageData,
 * with convert the data to SharedArrayBuffer.
 *
 * NOTE: the returned value is not an ImageData and can't be put into canvas.
 *
 * @param image original image data
 * @return the image data with shared
 */
function share(image: ImageData): ImageData {
	const { width, height, data } = image;
	const buffer = new SharedArrayBuffer(data.byteLength);
	const uint8Array = new Uint8ClampedArray(buffer);
	uint8Array.set(data);
	return { width, height, data: uint8Array } as any;
}

export type ImagePool = WorkerPool<ImageWorkerApi>;

export type ImageWorker = RPC.Remote<ImageWorkerApi>;

export function workerFactory() {
	// @ts-ignore ts-loader will convert the file to ES module.
	return new Worker(new URL("./worker", import.meta.url));
}

export function newImagePool(size: number): ImagePool {
	return new WorkerPool<ImageWorkerApi>(workerFactory, size);
}

export function setOriginalImage(pool: ImagePool, input: InputImage) {
	const { raw } = input;

	if ("SharedArrayBuffer" in window) {
		const shared = share(raw);
		return pool.runOnEach(r => r.setOriginal(shared));
	} else {
		return pool.runOnEach(r => r.setOriginal(raw));
	}
}

class PooledWorkerHandler<T extends Record<string, any>> implements ProxyHandler<T> {

	private readonly workerPool: WorkerPool<T>;

	constructor(workerPool: WorkerPool<T>) {
		this.workerPool = workerPool;
	}

	get(target: T, property: string) {
		return new Proxy(target, new InvokeHandler(this.workerPool, property));
	}
}

class InvokeHandler<T extends Record<string, any>> implements ProxyHandler<T> {

	private readonly workerPool: WorkerPool<T>;
	private readonly method: string;

	constructor(workerPool: WorkerPool<T>, method: string) {
		this.workerPool = workerPool;
		this.method = method;
	}

	apply(_: T, __: unknown, argArray: any[]) {
		const { workerPool, method } = this;
		return workerPool.run(worker => worker[method](...argArray));
	}
}

export function getPooledWorker<T>(workerPool: WorkerPool<T>) {

	// The target must be a function, see https://stackoverflow.com/a/32360219
	return new Proxy(noop as any, new PooledWorkerHandler(workerPool)) as RPC.Remote<T>;
}
