import { Remote } from "comlink";
import { WorkerApi } from "../worker";
import { OptionType } from "../app/OptionTemplate";
import * as WebP from "./webp/client";
import * as AVIF from "./avif/client";
import { Dispatch } from "react";
import { ConvertOutput } from "../encode";

export const WebPOptionsTemplate = WebP.optionTemplate;

export interface OptionTemplate {
	label: string;
	name: string;
	type: OptionType<unknown, unknown>;
	defaultVariable?: true;
	when?: (vals: any, vars: any) => boolean;
}

interface EncodeResult {
	time: number;
	buffer: ArrayBuffer;
}

export interface OptionListProps {
	options: any;
	onChange: Dispatch<any>;
}

export interface ControlProps {
	options: any;
	outputs: ConvertOutput[];
	onChange: Dispatch<ConvertOutput[]>;
}

export interface ImageEncoder {
	name: string;
	extension: string;
	mimeType: string;

	getDefaultOptions(): any;

	OptionsPanel(props: OptionListProps): JSX.Element;

	Controls(props: ControlProps): JSX.Element;

	encode(options: any, worker: Remote<WorkerApi>): Promise<EncodeResult>;
}

export const ENCODERS: ImageEncoder[] = [WebP, AVIF];

export const ENCODER_MAP = Object.fromEntries(ENCODERS.map(e => [e.name, e]));
