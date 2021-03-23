import { OptionType } from "../form";
import { EncoderState } from "./index";

export function buildOptions(templates: OptionType[], state: EncoderState) {
	const { varNames, values, ranges } = state;

	function map(list: any[], t: OptionType) {
		return list
			.map(options => {
				if (varNames.includes(t.id)) {
					return t.generate(ranges[t.id], options);
				}
				t.populate(values[t.id], options);
				return [options];
			})
			.reduce((p, c) => p.concat(c), []);
	}

	return templates.reduce(map, [{}]);
}

export function mergeOptions<T>(base: T, from: Partial<T>) {
	const invalidKey = process.env.NODE_ENV === "production"
		? undefined
		: Object.keys(from).find(k => !(k in base));

	if (invalidKey) {
		throw new Error(`Unexpected options property: ${invalidKey}`);
	}
	return { ...base, ...from } as T;
}

export interface Encoder<T> {
	encode(data: BufferSource, width: number, height: number, options: T): Uint8Array | null;
}

export interface EncodeModule<T> {
	getEncoder(): Promise<Encoder<T>>;
}

export function createEncodeFn<T>(module: EncodeModule<T>) {
	let encoder: Promise<Encoder<T>> | undefined;

	return async (image: ImageData, options: T) => {
		const { data, width, height } = image;
		if (!encoder) {
			encoder = module.getEncoder();
		}
		const result = (await encoder).encode(data, width, height, options);
		if (result) {
			return result.buffer;
		}
		throw new Error("Encoding error");
	};
}

export interface Decoder {
	decode(data: BufferSource): ImageData | null;
}

export interface DecodeModule {
	getDecoder(): Promise<Decoder>;
}

export function createDecodeFn(module: DecodeModule) {
	let decoder: Promise<Decoder> | undefined;

	return async (data: ArrayBuffer) => {
		if (!decoder) {
			decoder = module.getDecoder();
		}
		const result = (await decoder).decode(data);
		if (result) {
			return result;
		}
		throw new Error("Decoding error");
	};
}
