import { ImageWorker } from "../features/image-worker.ts";
import { EncodeResult } from "./common.ts";
import * as MozJPEG from "./mozjpeg/client.ts";
import * as JXL from "./jxl/client.ts";
import * as WebP from "./webp/client.ts";
import * as AVIF from "./avif/client.ts";
import * as WebP2 from "./webp2/client.ts";
import { ControlType, OptionsKeyPair, OptionStateMap, OptionType } from "../form/index.ts";

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

	function mapRange(pair: OptionsKeyPair, template: OptionType) {
		const { key, options } = pair;
		const { id } = template;
		const { range } = state[id];

		return template.getValues(range).map(value => {
			const k = { ...key, [id]: value };
			const o = { ...options };
			template.populate(value, o);

			return { key: k, options: o } as OptionsKeyPair;
		});
	}

	let list: OptionsKeyPair[] = [{
		key: {},
		options: { ...defaultOptions },
	}];

	const controls: ControlType[] = [];

	for (const template of templates) {
		const { isVariable, value, range } = state[template.id];

		if (isVariable) {
			list = list.flatMap(p => mapRange(p, template));
			controls.push(template.createControl(range));
		} else {
			list.forEach(p => template.populate(value, p.options));
		}
	}

	return { optionsList: list, controls };
}
