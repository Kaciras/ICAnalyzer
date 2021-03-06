import { Dispatch } from "react";
import { Remote } from "comlink";
import { WorkerApi } from "../worker";
import { ConvertOutput } from "../encode";
import { OptionType } from "../form/base";
import * as WebP from "./webp/client";

export interface State {
	varNames: string[];
	values: Record<string, unknown>;
	variables: Record<string, unknown>;
}

export interface OptionTemplate {
	label: string;
	name: string;
	type: OptionType;
	defaultVariable?: true;
	when?: (vals: any, vars: any) => boolean;
}

export interface EncodeResult {
	time: number;
	buffer: ArrayBuffer;
}

export interface OptionListProps {
	state: State;
	onChange: Dispatch<any>;
}

export interface ControlProps {
	state: State;
	outputs: ConvertOutput[];
	onChange: Dispatch<ConvertOutput[]>;
}

export interface ImageEncoder {
	name: string;
	extension: string;
	mimeType: string;

	getDefaultOptions(): any;

	getOptionsList(state: State): any[];

	OptionsPanel(props: OptionListProps): JSX.Element;

	Controls(props: ControlProps): JSX.Element;

	encode(options: any, worker: Remote<WorkerApi>): Promise<EncodeResult>;
}

export const ENCODERS: ImageEncoder[] = [WebP];

export const ENCODER_MAP = Object.fromEntries(ENCODERS.map(e => [e.name, e]));
