import * as SSIM from "ssim.js";
import { ButteraugliOptions } from "../lib/diff";
import { MetricMeta } from "./app";
import { AnalyzeResult } from "./analyzing";
import { ImageWorker } from "./image-worker";

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

export function getMetricsMeta(options: MeasureOptions) {
	const { SSIM, PSNR, butteraugli } = options;
	let calculations = 0;

	const metricsMeta: MetricMeta[] = [
		// { key: "ratio", name: "Compression Ratio %" },
	];
	if (PSNR.enabled) {
		calculations++;
		metricsMeta.push({ key: "PSNR", name: "PSNR (db)" });
	}
	if (SSIM.enabled) {
		calculations++;
		metricsMeta.push({ key: "SSIM", name: "SSIM %" });
	}
	if (butteraugli.enabled) {
		calculations++;
		metricsMeta.push({ key: "butteraugli", name: "Butteraugli Score" });
	}

	return { calculations, metricsMeta };
}

export function measure(
	config: MeasureOptions,
	worker: ImageWorker,
	result: AnalyzeResult,
	onProgress: () => void,
) {
	const tasks = [];

	for (const id of Object.keys(handlers)) {
		const a = config[id];
		if (typeof a !== "object") {
			continue;
		}
		const { enabled, options } = a;
		if (!enabled) {
			continue;
		}
		const t = handlers[id].calc(worker, result, options);
		if (t.then) {
			tasks.push(t.then(onProgress));
		}
	}

	return Promise.all(tasks);
}

interface Handler {
	name: string;
	immediately?: boolean;

	calc(worker: ImageWorker, result: AnalyzeResult, options: any): void | Promise<void>;
}

const handlers: Record<string, Handler> = {
	ratio: {
		name: "Compression Ratio %",
		immediately: true,
		calc(worker, result) {
			const { metrics, data, file } = result;
			metrics.ratio = data.data.byteLength / file.size * 100;
		},
	},
	SSIM: {
		name: "SSIM %",
		async calc(worker, result, options) {
			const { data, metrics } = result;
			metrics.SSIM = await worker.calcSSIM(data, options) * 100;
		},
	},
	PSNR: {
		name: "PSNR (db)",
		async calc(worker, result) {
			const { data, metrics } = result;
			metrics.PSNR = await worker.calcPSNR(data);
		},
	},
	butteraugli: {
		name: "Butteraugli Score",
		async calc(r, result, options) {
			const { data, metrics } = result;
			const { width, height } = data;

			const { score, heatMap } = await r.calcButteraugli(data, options);
			metrics.butteraugli = score;
			result.heatMap = rgbaToImage(heatMap, width, height);
		},
	},
};
