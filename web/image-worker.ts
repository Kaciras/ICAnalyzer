import { Remote } from "comlink";
import { NOOP } from "./utils";
import type { ImageWorkerApi } from "./worker";
import WorkerPool from "./WorkerPool";

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
export function share(image: ImageData): ImageData {
	const { width, height, data } = image;
	const buffer = new SharedArrayBuffer(data.byteLength);
	const uint8Array = new Uint8ClampedArray(buffer);
	uint8Array.set(data);
	return { width, height, data: uint8Array };
}

export type ImagePool = WorkerPool<ImageWorkerApi>;

export type ImageWorker = Remote<ImageWorkerApi>;

export function workerFactory() {
	// @ts-ignore ts-loader will convert the file to ES module.
	return new Worker(new URL("./worker", import.meta.url));
}

export function newImagePool(size: number, image: ImageData): Promise<ImagePool> {
	const pool = new WorkerPool<ImageWorkerApi>(workerFactory, size);

	if ("SharedArrayBuffer" in window) {
		image = share(image);
	}
	return pool.runOnEach(r => r.setOriginal(image)).then(() => pool);
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

	apply(target: T, thisArg: any, argArray: any[]) {
		const { workerPool, method } = this;
		return workerPool.run(worker => worker[method](...argArray));
	}
}

export function getPooledWorker<T>(workerPool: WorkerPool<T>) {

	// The target must be a function, see https://stackoverflow.com/a/32360219
	return new Proxy(NOOP as any, new PooledWorkerHandler(workerPool)) as Remote<T>;
}
