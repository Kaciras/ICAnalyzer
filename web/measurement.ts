import * as SSIM from "ssim.js";
import { ButteraugliOptions } from "../lib/diff";
import { MetricMeta } from "./app";

interface SimpleField {
	enabled: boolean;
}

interface Field<T> extends SimpleField {
	options: T;
}

export interface MeasureOptions {
	version: number;
	workerCount: number;

	encodeTime: SimpleField;

	SSIM: Field<SSIM.Options>;
	PSNR: SimpleField;
	butteraugli: Field<ButteraugliOptions>;
}

export function getMetricsMeta(options: MeasureOptions) {
	const { SSIM, PSNR, butteraugli } = options;
	let calculations = 0;
	const metricsMeta: MetricMeta[] = [];

	if (PSNR.enabled) {
		calculations++;
		metricsMeta.push({ key: "psnr", name: "PSNR (db)" });
	}
	if (SSIM.enabled) {
		calculations++;
		metricsMeta.push({ key: "ssim", name: "SSIM %" });
	}
	if (butteraugli.enabled) {
		calculations++;
		metricsMeta.push({ key: "butteraugli", name: "Butteraugli Score" });
	}

	return { calculations, metricsMeta };
}

