import * as Comlink from "comlink";
import { OptionsKeyPair, OptionType } from "../form";
import { EncoderState, OptionPanelProps } from "./index";

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

export function renderOption(template: OptionType, props: OptionPanelProps) {
	const { id, OptionField } = template;
	const { state, onChange } = props;
	const { varNames, values, ranges } = state;

	function handleTypeChange(value: boolean) {
		let { varNames } = state;
		if (value) {
			varNames.push(id);
		} else {
			varNames = varNames.filter(v => v !== id);
		}
		onChange({ ...state, varNames });
	}

	function handleValueChange(value: any) {
		onChange({ ...state, values: { ...values, [id]: value } });
	}

	function handleRangeChange(range: any) {
		onChange({ ...state, ranges: { ...ranges, [id]: range } });
	}

	return <OptionField
		key={id}
		isVariable={varNames.includes(id)}
		value={values[id]}
		range={ranges[id]}
		onValueChange={handleValueChange}
		onRangeChange={handleRangeChange}
		onVariabilityChange={handleTypeChange}
	/>;
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

export interface EncodeResult {
	time: number;
	buffer: ArrayBufferLike;
}

export function wasmEncodeFn<T>(loader: EncodeModuleLoader<T>) {
	let loadModuleTask: Promise<EncodeModule<T>> | undefined;

	return async (image: ImageData, options: T) => {
		const { data, width, height } = image;
		const module = await (loadModuleTask ??= loader());

		const start = performance.now();
		const output = module.encode(data, width, height, options);
		const end = performance.now();

		if (!output) {
			throw new Error("Encoding error");
		}

		const result: EncodeResult = {
			time: (end - start) / 1000,
			buffer: output.buffer,
		};
		return Comlink.transfer(result, [result.buffer]);
	};
}

export interface DecodeModule {
	decode(data: BufferSource): ImageData | null;
}

export type DecodeModuleLoader = () => Promise<DecodeModule>;

export function wasmDecodeFn(loader: DecodeModuleLoader) {
	let loadModuleTask: Promise<DecodeModule> | undefined;

	return async (data: ArrayBuffer) => {
		const module = await (loadModuleTask ??= loader());

		const output = module.decode(data);
		if (!output) {
			throw new Error("Decoding error");
		}
		return Comlink.transfer(output, [output.data.buffer]);
	};
}
