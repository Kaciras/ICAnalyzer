import { CPSrcObject } from "@kaciras/utilities/browser";
import { ImageWorker } from "../features/image-worker.ts";
import { EncodeResult } from "./common.ts";
import * as MozJPEG from "./mozjpeg/client.ts";
import * as JXL from "./jxl/client.ts";
import * as WebP from "./webp/client.ts";
import * as AVIF from "./avif/client.ts";
import * as WebP2 from "./webp2/client.ts";
import { ControlType, OptionStateMap, OptionType } from "../form/index.ts";

export interface ImageEncoder {
	name: string;
	extension: string;
	mimeType: string;

	templates: OptionType[];
	defaultOptions: Record<string, any>;

	encode(options: any, worker: ImageWorker): Promise<EncodeResult>;
}

export const ENCODERS: ImageEncoder[] = [MozJPEG, JXL, WebP, AVIF, WebP2];

export const ENCODER_MAP = Object.fromEntries(ENCODERS.map(e => [e.name, e]));

const names = ENCODERS.map(e => e.name);

export function getEncoderNames(object: Record<string, unknown>) {
	return names.filter(name => name in object);
}

export function buildProfiles(encoder: ImageEncoder, state: OptionStateMap) {
	const { defaultOptions, templates } = encoder;

	const variables: CPSrcObject = {};
	const constants = { ...defaultOptions };
	const controls: ControlType[] = [];

	let size = 1;

	for (const template of templates) {
		const { isVariable, value, range } = state[template.id];

		if (!isVariable) {
			template.populate(value, constants);
		} else {
			const values = template.getValues(range);
			size *= values.length;
			variables[template.id] = values;
			controls.push(template.createControl(range));
		}
	}

	return { size, variables, constants, controls };
}
