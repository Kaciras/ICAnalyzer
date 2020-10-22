import { OptionType } from "../component/OptionTemplate";
import { Drawable } from "../decode";
import { Remote } from "comlink";
import { WorkerApi } from "../worker";

export { optionTemplate as WebPOptionsTemplate } from "./webp";

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

export interface ImageEncoder {
	name: string;
	extension: string;
	mimeType: string;
	optionTemplate: OptionTemplate[];

	encode(options: any, worker: Remote<WorkerApi>): Promise<ArrayBuffer>;
}
