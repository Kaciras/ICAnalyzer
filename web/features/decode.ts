import { RPC } from "@kaciras/utilities/browser";
import { ImageWorkerApi } from "./worker.ts";
import { ImageWorker, workerFactory } from "./image-worker.ts";

/**
 * Detect file type by its header, only support modern image formats.
 * We don't sniff for classic image because browser already do that.
 *
 * @param buffer The file data, must have greater than 12 bytes length.
 */
function sniffMimeType(buffer: ArrayBufferLike) {
	if (buffer.byteLength < 12) {
		return;
	}
	const view = new DataView(buffer);
	const s0 = view.getUint16(0);
	const i0 = view.getUint32(0);
	const i8 = view.getUint32(8);

	if (i0 === 0x716F6966) {
		return "image/qoi";
	}
	if (s0 === 0xFF0A) {
		return "image/jxl";
	}
	if (s0 === 0xF4FF && view.getUint8(2) === 0x6F) {
		return "image/webp2";
	}
	switch (i8) {
		case 0x57454250:
			return "image/webp";
		case 0x61766966:
			return "image/avif";
		case 0x68656963:
			return "image/heic";
		case 0x0d0a870a:
			if (i0 === 0x0000000C && view.getUint32(4) === 0x4A584C20)
				return "image/jxl";
	}
}

const decodeUnsupported = new Set<string>();

async function blobToImg(blob: Blob) {
	const imgElement = document.createElement("img");
	imgElement.decoding = "async";
	imgElement.src = URL.createObjectURL(blob);
	try {
		await imgElement.decode();
		return imgElement;
	} finally {
		URL.revokeObjectURL(imgElement.src);
	}
}

/**
 * Convert ImageBitmap or <img> element to RGBA data,
 * uses WebGL2 context to avoid alpha premultiply loss.
 *
 * @see https://stackoverflow.com/a/60564905/7065321
 */
function drawableToImageData(bitmap: ImageBitmap | HTMLImageElement) {
	const canvas = document.createElement("canvas");
	const gl = canvas.getContext("webgl2")!;
	const { width, height } = bitmap;

	gl.activeTexture(gl.TEXTURE0);
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	const framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
	gl.drawBuffers([gl.NONE]);

	const data = new Uint8ClampedArray(width * height * 4);
	gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
	return new ImageData(data, width, height);
}

/**
 * Firefox throws if you try to draw an SVG to canvas that doesn't have width/height.
 * In Chrome it loads, but drawImage behaves weirdly.
 * This function sets width/height if it isn't already set.
 *
 * @param svgXml The SVG image with width/height attributes
 */
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

async function svgToImageData(svgXml: string) {
	svgXml = ensureSVGSize(svgXml);
	const blob = new Blob([svgXml], { type: "image/svg+xml" });
	return drawableToImageData(await blobToImg(blob));
}

export async function decode(blob: Blob, worker?: ImageWorker) {
	const buffer = await blob.arrayBuffer();
	const type = (blob.type || sniffMimeType(buffer)) ?? "";

	if (type === "image/svg+xml") {
		return blob.text().then(svgToImageData);
	}

	/*
	 * Squoosh uses <picture> + <img> to test codec support of browser, But it seems
	 * simpler to me to just decode it and determine by whether it succeeded or not.
	 *
	 * https://github.com/GoogleChromeLabs/squoosh/blob/19beb1a7ab5ab7df9625edaf7c3bf71a50e183ae/src/client/lazy-app/util/index.ts#L60
	 */
	if (!decodeUnsupported.has(type)) {
		try {
			const bitmap = await createImageBitmap(blob, {
				premultiplyAlpha: "none",
			});
			return drawableToImageData(bitmap);
		} catch {
			decodeUnsupported.add(type);
			console.info(`Native decode failed for ${type}, switch to WASM decoder.`);
		}
	}

	worker ??= RPC.probeClient<ImageWorkerApi>(workerFactory());
	const input = RPC.transfer(new Uint8Array(buffer), [buffer]);
	switch (type.toLowerCase()) {
		case "image/jpeg":
			return worker.jpegDecode(input);
		case "image/png":
			return worker.pngDecode(input);
		case "image/webp":
			return worker.webpDecode(input);
		case "image/avif":
			return worker.avifDecode(input);
		case "image/heic":
			return worker.heicDecode(input);
		case "image/jxl":
			return worker.jxlDecode(input);
		case "image/qoi":
			return worker.qoiDecode(input);
		case "image/webp2":
			return worker.webp2Decode(input);
		default:
			throw new Error("Unsupported image format");
	}
}
