import { Dispatch } from "react";
import { ImageWorker } from "../features/image-worker";
import { ControlType, OptionsKeyPair } from "../form";
import { EncodeResult } from "./common";
import * as MozJPEG from "./mozjpeg/client";
import * as JXL from "./jxl/client";
import * as WebP from "./webp/client";
import * as AVIF from "./avif/client";
import * as WebP2 from "./webp2/client";

interface OptionState {
	value: any;
	range: any;
	isVariable: boolean;
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

	getState(saved?: EncoderState): EncoderState;

	OptionsPanel(props: OptionPanelProps): JSX.Element;

	getOptionsList(state: EncoderState): OptionsKeyPair[];

	getControls(state: EncoderState): ControlType[];

	encode(options: any, worker: ImageWorker): Promise<EncodeResult>;
}

export const ENCODERS: ImageEncoder[] = [MozJPEG, JXL, WebP, AVIF, WebP2];

export const ENCODER_MAP = Object.fromEntries(ENCODERS.map(e => [e.name, e]));

const names = ENCODERS.map(e => e.name);

export function getEncoderNames(object: Record<string, unknown>) {
	return names.filter(name => name in object);
}
