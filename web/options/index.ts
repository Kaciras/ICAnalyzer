import { OptionType } from "../app/OptionTemplate";
import { Remote } from "comlink";
import { WorkerApi } from "../worker";
import * as WebP from "./webp";
import * as AVIF from "./avif";

export const WebPOptionsTemplate = WebP.optionTemplate;

export interface OptionTemplate {
	label: string;
	name: string;
	type: OptionType<unknown, unknown>;
	defaultVariable?: true;
	when?: (vals: any, vars: any) => boolean;
}

export function createOptionsList(template: OptionTemplate[]) {

}

interface EncodeResult {
	time: number;
	buffer: ArrayBuffer;
}

export interface ImageEncoder {
	name: string;
	extension: string;
	mimeType: string;
	optionTemplate: OptionTemplate[];

	encode(options: any, worker: Remote<WorkerApi>): Promise<EncodeResult>;
}

export const ENCODERS: ImageEncoder[] = [WebP, AVIF];

export const ENCODER_MAP = Object.fromEntries(ENCODERS.map(e => [e.name, e]));
