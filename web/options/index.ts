import { OptionType } from "../component/OptionTemplate";
import { Drawable } from "../decode";
import * as Comlink from "comlink";
import { Remote } from "comlink";
import { WorkerApi } from "../worker";
import WorkerUrl from "worker-plugin/loader*";

export { WebPOptionsTemplate } from "./webp";

export interface OptionTemplate {
	label: string;
	name: string;
	type: OptionType<unknown, unknown>;
	defaultVariable?: true;
}

export function createOptionsList(template: OptionTemplate[]) {

}

interface EncodeResult {
	buffer: ArrayBuffer;
	data: ImageData;
	drawable: Drawable;
}

export interface Encoder {

	setImage(image: ImageData): Promise<void>;

	terminate(): void;

	encode(options: any): Promise<EncodeResult>;
}

export type EncoderFactory = () => Encoder;

export interface ImageEncoder {
	name: string;
	extension: string;
	mimeType: string;
	createEncoder: EncoderFactory;
	optionTemplate: OptionTemplate[];
}

export abstract class WorkerEncoder implements Encoder {

	protected readonly worker: Worker;
	protected readonly remote: Remote<WorkerApi>;

	protected constructor() {
		this.worker = new Worker(WorkerUrl);
		this.remote = Comlink.wrap<WorkerApi>(this.worker);
		Comlink.releaseProxy
	}

	setImage(image: ImageData) {
		return this.remote.setImageToEncode(image);
	}

	terminate() {
		this.worker.terminate();
	}

	abstract encode(options: any): Promise<EncodeResult>;
}
