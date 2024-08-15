/*
 * Copyright 2020 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Modifications copyright (C) 2024 Kaciras
 */
import { RPC } from "@kaciras/utilities/browser";
import { ImageWorkerApi } from "./worker.ts";
import { ImageWorker, workerFactory } from "./image-worker.ts";

const magicNumbers = [
	["image/png", "\x89PNG\x0D\x0A\x1A\x0A"],
	["image/jpeg", "\xFF\xD8\xFF"],
	["image/webp", "RIFF....WEBPVP8[LX ]"],
	["image/avif", "\x00\x00\x00 ftypavif\x00\x00\x00\x00"],
	["image/gif", "GIF87a"],
	["image/gif", "GIF89a"],
	["application/pdf", "%PDF-"],
	["image/bmp", "BM"],
	["image/qoi", "qoif"],
	["image/tiff", "I I"],
	["image/tiff", "II"],
	["image/tiff", "MM\x00"],
	["image/webp2", "\xF4\xFF\x6F"],
	["image/jxl", "\xff\x0a"],
	["image/jxl", "\x00\x00\x00\x0cJXL \x0d\x0a\x87\x0a"],
];

function sniffMimeType(buffer: ArrayBufferLike) {
	const magicStr = Array.from(new Uint8Array(buffer, 0, 16))
		.map(c => String.fromCodePoint(c)).join("");
	return magicNumbers.find(i => magicStr.startsWith(i[1]))?.[0] ?? "";
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
async function drawableToImageData(bitmap: ImageBitmap | HTMLImageElement) {
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
	const type = blob.type || sniffMimeType(buffer);

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
			const bitmap = await createImageBitmap(blob,{
				premultiplyAlpha: "none",
			});
			return await drawableToImageData(bitmap);
		} catch (e) {
			decodeUnsupported.add(type);
			console.info(`Native decode failed for ${type}, switch to WASM decoder.`);
		}
	}

	worker ??= RPC.probeClient<ImageWorkerApi>(workerFactory());
	const input = RPC.transfer(buffer, [buffer]);
	switch (type) {
		case "image/avif":
			return worker.avifDecode(input);
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
