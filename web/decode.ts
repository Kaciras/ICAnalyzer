import { wrap } from "comlink";
import { blobToImg, drawableToImageData } from "squoosh/src/lib/util";
import { WorkerApi } from "./worker";
import { detectAVIFSupport, detectWebPSupport } from "./utils";
import { newWorker } from "./encode";

export async function decodeImageNative(blob: Blob) {
	const bitmap = "createImageBitmap" in self
		? await createImageBitmap(blob)
		: await blobToImg(blob);

	const canvas = document.createElement("canvas");
	const { width, height } = bitmap;
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("Canvas not initialized");
	}
	ctx.drawImage(bitmap, 0, 0);
	return ctx.getImageData(0, 0, width, height);
}

type featureDetector = () => Promise<boolean>;

type DecodeFunction = (blob: Blob) => Promise<ImageData>;

function autoSelect(
	checkFn: featureDetector,
	native: DecodeFunction,
	polyfill: DecodeFunction,
): DecodeFunction {
	let bestDecodeFn: DecodeFunction;

	async function choose(blob: Blob) {
		if (await checkFn()) {
			bestDecodeFn = native;
		} else {
			bestDecodeFn = polyfill;
		}
		return await bestDecodeFn(blob);
	}

	bestDecodeFn = choose;

	return buffer => bestDecodeFn(buffer);
}

function decodeAVIFWorker(blob: Blob) {
	const worker = newWorker();
	return blob.arrayBuffer()
		.then(buf => wrap<WorkerApi>(worker).avifDecode(buf))
		.finally(() => worker.terminate());
}

function decodeWebPWorker(blob: Blob) {
	const worker = newWorker();
	return blob.arrayBuffer()
		.then(buf => wrap<WorkerApi>(worker).webpDecode(buf))
		.finally(() => worker.terminate());
}

export const decodeWebP = autoSelect(detectWebPSupport, decodeImageNative, decodeWebPWorker);
export const decodeAVIF = autoSelect(detectAVIFSupport, decodeImageNative, decodeAVIFWorker);

function ensureSVGSize(svgXml: string) {
	const parser = new DOMParser();
	const document = parser.parseFromString(svgXml, "image/svg+xml");
	const svg = document.documentElement;

	if (svg.getAttribute("width") && svg.getAttribute("height")) {
		return svgXml;
	}

	const viewBox = svg.getAttribute("viewBox");
	if (viewBox === null) {
		throw Error("SVG must have width/height or viewBox");
	}
	const [, , width, height] = viewBox.split(/\s+/);
	svg.setAttribute("width", width);
	svg.setAttribute("height", height);

	return new XMLSerializer().serializeToString(document);
}

export async function svgToImageData(svgXml: string) {
	svgXml = ensureSVGSize(svgXml);
	const blob = new Blob([svgXml], { type: "image/svg+xml" });
	return drawableToImageData(await blobToImg(blob));
}

export function decode(blob: Blob) {
	switch (blob.type) {
		case "image/svg+xml":
			return blob.text().then(svgToImageData);
		case "image/webp":
			return decodeWebP(blob);
		case "image/avif":
			return decodeAVIF(blob);
		default:
			return decodeImageNative(blob);
	}
}
