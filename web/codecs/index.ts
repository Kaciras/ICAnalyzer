import { Dispatch } from "react";
import { Remote } from "comlink";
import { WorkerApi } from "../worker";
import * as WebP from "./webp/client";

export interface EncoderState {
	varNames: string[];
	data: Record<string, any>;
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
	varName: string | false;
	onChange: Dispatch<any>;
	onVariableChange: Dispatch<string>;
}

export interface ImageEncoder {
	name: string;
	extension: string;
	mimeType: string;

	getDefaultOptions(): any;

	getOptionsList(state: EncoderState): any[];

	OptionsPanel(props: OptionListProps): JSX.Element;

	Controls(props: ControlProps): JSX.Element;

	encode(options: any, worker: Remote<WorkerApi>): Promise<EncodeResult>;
}

export const ENCODERS: ImageEncoder[] = [WebP];

export const ENCODER_MAP = Object.fromEntries(ENCODERS.map(e => [e.name, e]));
