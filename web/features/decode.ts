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
 * Modifications copyright (C) 2020 Kaciras
 */
import { RPC } from "@kaciras/utilities/browser";
import { blobToImg, canDecodeImageType, sniffMimeType } from "squoosh/src/client/lazy-app/util";
import { drawableToImageData } from "squoosh/src/client/lazy-app/util/canvas";
import { ImageWorkerApi } from "./worker";
import { ImageWorker, workerFactory } from "./image-worker";

async function decodeImageNative(blob: Blob) {
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
	let { type } = blob;

	if (!type) {
		type = await sniffMimeType(blob);
	}
	if (type === "image/svg+xml") {
		return blob.text().then(svgToImageData);
	}
	if (await canDecodeImageType(type)) {
		return decodeImageNative(blob);
	}

	worker ??= RPC.probeClient<ImageWorkerApi>(workerFactory());
	const buffer = await blob.arrayBuffer();
	switch (type) {
		case "image/webp":
			return worker.webpDecode(buffer);
		case "image/avif":
			return worker.avifDecode(buffer);
		case "image/jxl":
			return worker.jxlDecode(buffer);
		case "image/webp2":
			return worker.webp2Decode(buffer);
		default:
			return decodeImageNative(blob);
	}
}
