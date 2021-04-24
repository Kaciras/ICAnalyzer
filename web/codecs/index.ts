import { Dispatch } from "react";
import { Remote } from "comlink";
import { ControlType, OptionsKeyPair } from "../form";
import { WorkerApi } from "../worker";
import * as MozJPEG from "./mozjpeg/client";
import * as JXL from "./jxl/client";
import * as WebP from "./webp/client";
import * as AVIF from "./avif/client";
import * as WebP2 from "./webp2/client";

export interface EncoderState {
	varNames: string[];
	values: Record<string, unknown>;
	ranges: Record<string, unknown>;
}

export interface EncodeResult {
	time: number;
	buffer: ArrayBuffer;
}

export interface OptionListProps {
	state: EncoderState;
	onChange: Dispatch<EncoderState>;
}

export interface EncodeConfig {
	controls: ControlType[];
	optionsList: OptionsKeyPair[];
}

export interface ImageEncoder {
	name: string;
	extension: string;
	mimeType: string;

	getState(saved?: EncoderState): EncoderState;

	OptionsPanel(props: OptionListProps): JSX.Element;

	getOptionsList(state: EncoderState): EncodeConfig;

	encode(options: any, worker: Remote<WorkerApi>): Promise<EncodeResult>;
}

export const ENCODERS: ImageEncoder[] = [MozJPEG, JXL, WebP, AVIF, WebP2];

export const ENCODER_MAP = Object.fromEntries(ENCODERS.map(e => [e.name, e]));
