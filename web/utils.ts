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
