import { Dispatch, SetStateAction, useEffect, useState } from "react";

export const NOOP = () => {};

export const IDENTITY = <T>(v: T) => v;

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
 * @param fraction
 */
export function bytes(value: number, fraction = 1024) {
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

export interface ProgressState {
	value: number;
	max: number;
	increase: () => void;
	reset: (max: number) => void;
}

export function useProgress(initialMax = 1) {
	const [max, setMax] = useState(initialMax);
	const [value, setValue] = useState(0);

	function reset(value: number) {
		setValue(0);
		setMax(value);
	}

	function increase() {
		setValue(v => v + 1);
	}

	return { value, max, increase, reset } as ProgressState;
}

type LocalStorageState<T> = [T, Dispatch<SetStateAction<T>>, () => void];

export function useLocalStorage<T>(key: string, processor: (saved?: T) => T) {
	const [value, setValue] = useState(() => {
		const v = localStorage.getItem(key);
		return processor(v ? JSON.parse(v) : undefined);
	});

	function persist() {
		localStorage.setItem(key, JSON.stringify(value));
	}

	useEffect(() => persist, [value]);

	return [value, setValue, persist] as LocalStorageState<T>;
}

// JSON.stringify is not deterministic, be careful with the properties order.
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
