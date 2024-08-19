import React, { ComponentType, SVGProps } from "react";

export type SVGComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const stopPropagation = (e: MouseEvent | React.MouseEvent) => e.stopPropagation();

export function drawImage(data: ImageData, el: HTMLCanvasElement | null) {
	el?.getContext("2d")!.putImageData(data, 0, 0);
}

/**
 * Premultiply image's RGB channels with the alpha channel.
 * It's also equivalent to compositing the image with an black background.
 *
 * @param image The original image, may contain transparent pixels.
 * @return Premultiplied image, all pixels are opaque.
 */
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

export type ResizeMethod = "pixelated" | "low" | "medium" | "high";

/**
 * Resizes an ImageData object to the specified dimensions.
 *
 * Due to resize is always lossy, we don't care about the lossy nature of premultiplied alpha.
 *
 * @param image The ImageData object to resize.
 * @param dw New width.
 * @param dh New height.
 * @param method Control the resize quality.
 */
export function builtinResize(image: ImageData, dw: number, dh: number, method: ResizeMethod) {
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
