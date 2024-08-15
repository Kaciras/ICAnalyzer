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
	const ctx2d = canvas.getContext("2d", { willReadFrequently: true })!;
	canvas.width = image.width;
	canvas.height = image.height;
	ctx2d.putImageData(image, 0, 0);

	if (method === "pixelated") {
		destCtx.imageSmoothingEnabled = false;
	} else {
		destCtx.imageSmoothingQuality = method;
	}

	destCtx.drawImage(canvas, 0, 0, image.width, image.height, 0, 0, dw, dh);
	return destCtx.getImageData(0, 0, dw, dh);
}
