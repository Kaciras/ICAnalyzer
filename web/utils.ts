import React, { ComponentType, SVGProps } from "react";

export type SVGComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const stopPropagation = (e: MouseEvent | React.MouseEvent) => e.stopPropagation();

export function drawImage(data: ImageData, el: HTMLCanvasElement | null) {
	if (el === null) {
		return;
	}
	const ctx = el.getContext("2d");
	if (ctx) {
		ctx.putImageData(data, 0, 0);
	} else {
		throw new Error("Canvas not initialized");
	}
}

export function premultiplyAlpha(image: ImageData) {
	const buf = image.data;
	const output = new Uint8ClampedArray(buf.length);

	for (let i = 0; i < buf.length; i += 4) {
		const p = buf[i + 3] / 255;
		output[i + 3] = 255;
		output[i] = buf[i] * p;
		output[i + 1] = buf[i + 1] * p;
		output[i + 2] = buf[i + 2] * p;
	}
	return new ImageData(output, image.width, image.height);
}

export type BuiltinResizeMethod = "pixelated" | "low" | "medium" | "high";

export function builtinResize(
	image: ImageData,
	dw: number,
	dh: number,
	method: BuiltinResizeMethod,
) {
	const canvasDest = document.createElement("canvas");
	canvasDest.width = dw;
	canvasDest.height = dh;
	const destCtx = canvasDest.getContext("2d")!;

	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
	canvas.width = image.width;
	canvas.height = image.height;
	ctx.putImageData(image, 0, 0);

	if (method === "pixelated") {
		destCtx.imageSmoothingEnabled = false;
	} else {
		destCtx.imageSmoothingQuality = method;
	}

	destCtx.drawImage(canvas, 0, 0, image.width, image.height, 0, 0, dw, dh);
	return destCtx.getImageData(0, 0, dw, dh);
}

export function getAlphaMask(image: ImageData) {
	const { data, width, height } = image;
	const rgb = data.slice();
	const alpha = new Uint8ClampedArray(data.length);

	for (let i = 0; i < data.length; i += 4) {
		rgb[i + 3] = 255;
		alpha[i] = data[i + 3];
		alpha[i + 1] = data[i + 3];
		alpha[i + 2] = data[i + 3];
	}
	return [
		new ImageData(rgb, width, height),
		new ImageData(alpha, width, height),
	];
}
