import * as Comlink from "comlink";
import { AVIFEncodeOptions } from "./worker/avif-encoder";
import { WebPEncodeOptions } from "./worker/webp-encoder";
import { EncodeWorker } from "./worker/utils";
import AVIFUrl from "worker-plugin/loader?esModule&name=avif!./worker/avif-encoder";
import WebPUrl from "worker-plugin/loader?esModule&name=webp!./worker/webp-encoder";

async function encode<T>(url: string, image: ImageData, optionsList: T[]) {
	const THREAD_COUNT = Math.min(4, optionsList.length);
	const results = new Array<Uint8Array>(optionsList.length);

	let index = 0;
	const tasks = new Array(THREAD_COUNT);

	async function drain(encoder: Comlink.Remote<EncodeWorker<T>>) {
		while (index < optionsList.length) {
			const i = index++;
			results[i] =  await encoder.encode(optionsList[i]);
		}
	}

	async function addWorker(initData: any) {
		const encoder = Comlink.wrap<EncodeWorker<T>>(new Worker(url));
		await encoder.initialize(initData);
		tasks.push(drain(encoder));
	}

	for (let i = 1; i < THREAD_COUNT; i++) {
		await addWorker(image);
	}
	await addWorker(Comlink.transfer(image, [image.data.buffer]));

	return Promise.all(tasks).then(() => results);
}

export function encodeAVIF(image: ImageData, optionsList: AVIFEncodeOptions[]) {
	return encode(AVIFUrl, image, optionsList);
}

export function encodeWebP(image: ImageData, optionsList: WebPEncodeOptions[]) {
	return encode(WebPUrl, image, optionsList);
}
