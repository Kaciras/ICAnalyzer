import * as Comlink from "comlink";
import { Remote } from "comlink";
import { blobToImg, drawableToImageData } from "squoosh/src/lib/util";
import { WorkerApi } from "./worker";
import { detectAVIFSupport, detectWebPSupport } from "./utils";
import { newWorker } from "./encoding";

export async function decodeImage(blob: Blob) {
	const bitmap = "createImageBitmap" in self
		? await createImageBitmap(blob)
		: await blobToImg(blob);

	const canvas = document.createElement("canvas");
	const { width, height } = bitmap;
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d")!;
	ctx.drawImage(bitmap, 0, 0);
	return ctx.getImageData(0, 0, width, height);
}

type featureDetector = () => Promise<boolean>;

type DecodeFunction = (buffer: ArrayBuffer) => Promise<ImageData>;

function autoSelect(
	checkFn: featureDetector,
	native: DecodeFunction,
	polyfill: DecodeFunction,
): DecodeFunction {
	let bestDecodeFn: DecodeFunction;

	async function choose(buffer: ArrayBuffer) {
		if (await checkFn()) {
			bestDecodeFn = native;
		} else {
			bestDecodeFn = polyfill;
		}
		return await bestDecodeFn(buffer);
	}

	bestDecodeFn = choose;

	return buffer => bestDecodeFn(buffer);
}

function decodeAVIFNative(buffer: ArrayBuffer) {
	return decodeImage(new Blob([buffer], { type: "image/avif" }));
}

async function decodeAVIFWorker(buffer: ArrayBuffer) {
	const worker = newWorker();
	const remote = Comlink.wrap<WorkerApi>(worker);
	return remote.avifDecode(buffer);
}

function decodeWebPNative(buffer: ArrayBuffer) {
	return decodeImage(new Blob([buffer], { type: "image/webp" }));
}

async function decodeWebPWorker(buffer: ArrayBuffer, worker?: Remote<WorkerApi>) {
	if (!worker) {
		worker = Comlink.wrap<WorkerApi>(newWorker());
	}
	return worker.webpDecode(buffer);
}

export const decodeWebP = autoSelect(detectWebPSupport, decodeWebPNative, decodeWebPWorker);
export const decodeAVIF = autoSelect(detectAVIFSupport, decodeAVIFNative, decodeAVIFWorker);

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
			return blob.arrayBuffer().then(decodeWebP);
		case "image/avif":
			return blob.arrayBuffer().then(decodeAVIF);
		default:
			return decodeImage(blob);
	}
}
