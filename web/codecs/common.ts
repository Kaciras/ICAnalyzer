import { OptionsKeyPair, OptionType } from "../form";
import { EncoderState } from "./index";
import * as Comlink from "comlink";

export function createState(templates: OptionType[]) {
	const values: Record<string, any> = {};
	const ranges: Record<string, any> = {};

	for (const t of templates) {
		const [value, range] = t.createState();
		values[t.id] = value;
		ranges[t.id] = range;
	}
	return { varNames: [], values, ranges } as EncoderState;
}

export function buildOptions(templates: OptionType[], state: EncoderState) {
	const { varNames, values, ranges } = state;

	function applyOption(list: OptionsKeyPair[], template: OptionType) {
		const { id } = template;

		if (varNames.includes(id)) {
			const newList: OptionsKeyPair[] = [];

			for (const { key, options } of list) {
				const generated = template.generate(ranges[id], key, options);
				newList.push(...generated);
			}
			return newList;
		} else {
			list.forEach(({ options }) => template.populate(values[id], options));
			return list;
		}
	}

	return templates.reduce(applyOption, [{ key: {}, options: {} }]);
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
		if (!result) {
			throw new Error("Encoding error");
		}
		return Comlink.transfer(result.buffer, [result.buffer]);
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
		if (!result) {
			throw new Error("Decoding error");
		}
		return Comlink.transfer(result, [result.data.buffer]);
	};
}
