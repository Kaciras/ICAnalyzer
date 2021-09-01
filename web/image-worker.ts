import type { ImageWorkerApi } from "./worker";
import WorkerPool from "./WorkerPool";
import { Remote } from "comlink";

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
