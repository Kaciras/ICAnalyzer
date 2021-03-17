import { Dispatch } from "react";
import { Remote } from "comlink";
import { WorkerApi } from "../worker";
import * as WebP from "./webp/client";

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

export interface ControlProps {
	state: EncoderState;
	variableName: string | false;
	onChange: Dispatch<Record<string, unknown>>;
	onVariableChange: Dispatch<string>;
}

export interface ImageEncoder {
	name: string;
	extension: string;
	mimeType: string;

	initControlState(ranges: EncoderState): Record<string, unknown>;

	Controls(props: ControlProps): JSX.Element;

	initOptionsState(saved?: EncoderState): any;

	OptionsPanel(props: OptionListProps): JSX.Element;

	getOptionsList(state: EncoderState): any[];

	encode(options: any, worker: Remote<WorkerApi>): Promise<EncodeResult>;
}

export const ENCODERS: ImageEncoder[] = [WebP];

export const ENCODER_MAP = Object.fromEntries(ENCODERS.map(e => [e.name, e]));
