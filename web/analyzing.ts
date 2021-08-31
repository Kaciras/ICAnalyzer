import type { WorkerApi } from "./worker";
import { InputImage } from "./app";
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

export function newWorker() {
	// @ts-ignore ts-loader will convert the file to ES module.
	return new Worker(new URL("./worker", import.meta.url));
}

export function initialize(pool: WorkerPool<WorkerApi>, input: InputImage) {
	const { raw } = input;

	if ("SharedArrayBuffer" in window) {
		const shared = share(raw);
		return  pool.runOnEach(r => r.setImageToEncode(shared));
	} else {
		return pool.runOnEach(r => r.setImageToEncode(raw));
	}
}
