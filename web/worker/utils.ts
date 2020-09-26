export interface EncodeWorker<T> {

	initialize(image: ImageData): void;

	encode(options: T): Promise<ArrayBuffer>;
}


export function initEmscriptenModule<T>(moduleFactory: any, wasmUrl: string) {
	return new Promise<T>((resolve) => {
		const module = moduleFactory({
			noInitialRun: true,
			locateFile(url: string) {
				if (url.endsWith(".wasm"))
					return wasmUrl;
				return url;
			},
			onRuntimeInitialized() {
				delete (module as any).then;
				resolve(module);
			},
		});
	});
}
