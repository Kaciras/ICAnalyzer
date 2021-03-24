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

export type EncodeModuleLoader<T> = () => Promise<EncodeModule<T>>;

export interface EncodeModule<T> {
	encode(data: BufferSource, width: number, height: number, options: T): Uint8Array | null;
}

export function wasmEncodeFn<T>(loader: EncodeModuleLoader<T>) {
	let module: Promise<EncodeModule<T>> | undefined;

	return async (image: ImageData, options: T) => {
		const { data, width, height } = image;
		if (!module) {
			module = loader();
		}
		const result = (await module).encode(data, width, height, options);
		if (result) {
			return result.buffer;
		}
		throw new Error("Encoding error");
	};
}

export interface DecodeModule {
	decode(data: BufferSource): ImageData | null;
}

export type DecodeModuleLoader = () => Promise<DecodeModule>;

export function wasmDecodeFn(loader: DecodeModuleLoader) {
	let module: Promise<DecodeModule> | undefined;

	return async (data: ArrayBuffer) => {
		if (!module) {
			module = loader();
		}
		const result = (await module).decode(data);
		if (result) {
			return result;
		}
		throw new Error("Decoding error");
	};
}
