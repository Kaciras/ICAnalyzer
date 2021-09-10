import { Dispatch } from "react";
import { ImageWorker } from "../features/image-worker";
import { EncodeResult } from "./common";
import * as MozJPEG from "./mozjpeg/client";
import * as JXL from "./jxl/client";
import * as WebP from "./webp/client";
import * as AVIF from "./avif/client";
import * as WebP2 from "./webp2/client";
import { OptionsGenerator } from "./options";

export enum OptionMode {
	Constant, Range
}

interface OptionState {
	value: any;
	range: any;
	mode: OptionMode;
}

export type EncoderState = Record<string, OptionState>;

export interface OptionPanelProps {
	state: EncoderState;
	onChange: Dispatch<EncoderState>;
}

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
