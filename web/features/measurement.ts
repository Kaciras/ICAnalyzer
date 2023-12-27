import * as SSIM from "ssim.js";
import { ButteraugliOptions } from "../../lib/diff.js";
import { AnalyzeResult, ImageWorker, InputImage } from "./image-worker.ts";

interface SimpleField {
	enabled: boolean;
}

interface Field<T> extends SimpleField {
	options: T;
}

export interface QualityOptions {
	SSIM: Field<SSIM.Options>;
	PSNR: SimpleField;
	butteraugli: Field<ButteraugliOptions>;
}

export interface MeasureOptions extends QualityOptions {
	version: number;
	workerCount: number;

	encodeTime: SimpleField;
}

function rgbaToImage(buffer: ArrayBufferLike, width: number, height: number) {
	const channels = buffer.byteLength / width / height;
	if (channels !== 4) {
		throw new Error("Buffer must be a 8-bit depth RGBA array");
	}
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("Could not create canvas context");
	}
	const imageData = ctx.createImageData(width, height);
	imageData.data.set(new Uint8ClampedArray(buffer));
	return imageData;
}

export interface MetricMeta {
	key: string;
	name: string;
}


interface MetricsType {
	name: string;
	immediately?: boolean;

	calc(
		worker: ImageWorker,
		original: InputImage,
		result: AnalyzeResult,
		options: any
	): void | Promise<void>;
}

interface BoundCalc {
	options: any;
	calc: MetricsType["calc"];
}

const handlers: Record<string, MetricsType> = {
	ratio: {
		name: "Compression Ratio %",
		immediately: true,
		calc(worker, original, result) {
			const { metrics, file } = result;
			metrics.ratio = file.size / original.file.size * 100;
		},
	},
	SSIM: {
		name: "SSIM %",
		async calc(worker, original, result, options) {
			const { data, metrics } = result;
			metrics.SSIM = await worker.calcSSIM(data, options) * 100;
		},
	},
	PSNR: {
		name: "PSNR (db)",
		async calc(worker, original, result) {
			const { data, metrics } = result;
			metrics.PSNR = await worker.calcPSNR(data);
		},
	},
	butteraugli: {
		name: "Butteraugli Score",
		async calc(worker, original, result, options) {
			const { data, metrics } = result;
			const { width, height } = data;

			const { score, heatMap } = await worker.calcButteraugli(data, options);
			metrics.butteraugli = score;
			result.heatMap = rgbaToImage(heatMap, width, height);
		},
	},
};

export interface Measurer {
	metrics: MetricMeta[];

	calculations: number;

	execute(original: InputImage, result: AnalyzeResult, onProgress: () => void): Promise<void>;
}

export function createMeasurer(config: MeasureOptions, worker: ImageWorker) {
	const metrics = [];
	const used: BoundCalc[] = [];

	let calculations = 0;

	for (const key of Object.keys(handlers)) {
		const { enabled, options } = (config as any)[key] ?? { enabled: true };
		if (!enabled) {
			continue;
		}
		const { name, calc, immediately } = handlers[key];
		if (!immediately) {
			calculations++;
		}
		used.push({ calc, options });
		metrics.push({ key, name });
	}

	function execute(original: InputImage, result: AnalyzeResult, onProgress: () => void) {
		const tasks = used
			.map(b => b.calc(worker, original, result, b.options))
			.filter(Boolean)

			// @ts-ignore
			.map(promise => promise.then(onProgress));

		return Promise.all(tasks) as unknown as Promise<void>;
	}

	return { calculations, metrics, execute } as Measurer;
}
