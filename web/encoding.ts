import * as Comlink from "comlink";
import { AVIFEncodeOptions } from "./worker/avif-encoder";
import { WebPEncodeOptions } from "./worker/webp_enc";

type WorkerFactory = () => Worker;

async function encode(workerFactory: WorkerFactory, image: ImageData, optionsList: any[]) {
	const THREAD_COUNT = Math.min(4, optionsList.length);

	let index = 0;
	const tasks = [];
	const results = new Array(optionsList.length);

	async function drain(encoder: any) {
		while (index < optionsList.length) {
			const i = index++;
			const webp = await encoder.encode(optionsList[i]);
			const blob = new Blob([webp], { type: "image/webp" });
			results[i] = await createImageBitmap(blob);
		}
	}

	for (let i = 1; i < THREAD_COUNT; i++) {
		const encoder = Comlink.wrap(workerFactory());

		await encoder.initialize(image);
		tasks.push(drain(encoder));
	}

	const encoder = Comlink.wrap(workerFactory());

	await encoder.initialize(Comlink.transfer(image, [image.data.buffer]));
	tasks.push(drain(encoder));

	return Promise.all(tasks).then(() => results);
}

export function encodeAVIF(image: ImageData, optionsList: AVIFEncodeOptions[]) {
	return encode(() => new Worker("./worker/avif-encoder", { type: "module" }), image, optionsList);
}

export function encodeWebP(image: ImageData, optionsList: WebPEncodeOptions[]) {
	return encode(() => new Worker("./worker/webp-encoder", { type: "module" }), image, optionsList);
}
