import * as Comlink from "comlink";

export type EncodeModuleLoader<T> = () => Promise<EncodeModule<T>>;

export interface EncodeModule<T> {
	encode(data: BufferSource, width: number, height: number, options: T): Uint8Array | null;
}

export interface EncodeResult {

	/** Time used for encoding (in seconds) */
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

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

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
