import { ImageWorker } from "../features/image-worker.ts";
import { EncodeResult } from "./common.ts";
import * as MozJPEG from "./mozjpeg/client.ts";
import * as JXL from "./jxl/client.ts";
import * as WebP from "./webp/client.ts";
import * as AVIF from "./avif/client.ts";
import * as WebP2 from "./webp2/client.ts";
import OptionsGenerator from "./OptionsGenerator.tsx";

export interface ImageEncoder {
	name: string;
	extension: string;
	mimeType: string;

	optionsGenerator: OptionsGenerator;

	encode(options: any, worker: ImageWorker): Promise<EncodeResult>;
}

export const ENCODERS: ImageEncoder[] = [MozJPEG, JXL, WebP, AVIF, WebP2];

export const ENCODER_MAP = Object.fromEntries(ENCODERS.map(e => [e.name, e]));

const names = ENCODERS.map(e => e.name);

export function getEncoderNames(object: Record<string, unknown>) {
	return names.filter(name => name in object);
}
