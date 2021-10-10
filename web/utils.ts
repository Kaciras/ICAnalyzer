import React, { ComponentType, SVGProps } from "react";

export type SVGComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const NOOP = () => {};

export const IDENTITY = <T>(v: T) => v;

export const stopPropagation = (e: MouseEvent | React.MouseEvent) => e.stopPropagation();

let uniqueKeyCounter = 1;

/**
 * Generate a unique number, it can be used as the key prop in React element.
 */
export function uniqueKey() {
	return uniqueKeyCounter += 1;
}

const SIZE_UNITS = ["", "K", "M", "G", "T", "P", "E", "Z", "Y"];

/**
 * Convert bytes to a human readable string.
 *
 * @param value The number to format.
 * @param fraction 1000 for SI or 1024 for IEC.
 */
export function bytes(value: number, fraction: 1024 | 1000 = 1024) {
	const size = Math.abs(value);

	if (size === 0) {
		return `${value.toFixed(2)} B`;
	}

	const i = ~~(Math.log2(size) / Math.log2(fraction));
	const v = value / (fraction ** i);
	return `${v.toFixed(2)} ${SIZE_UNITS[i]}B`;
}

export async function getFileFromUrl(url: string, signal?: AbortSignal) {
	const response = await fetch(url, { signal });
	const blob = await response.blob();

	const name = new URL(url).pathname.split("/").pop() || "download";

	const timeHeader = response.headers.get("last-modified");
	const lastModified = timeHeader ? new Date(timeHeader).getTime() : undefined;

	return new File([blob], name, { type: blob.type, lastModified });
}

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

// JSON.stringify is not deterministic, the property order in key object must be same as stored.
export class ObjectKeyMap<K, V> {

	private readonly table = new Map<string, V>();

	get size() {
		return this.table.size;
	}

	get(key: K) {
		return this.table.get(JSON.stringify(key))!;
	}

	set(key: K, value: V) {
		this.table.set(JSON.stringify(key), value);
	}
}
