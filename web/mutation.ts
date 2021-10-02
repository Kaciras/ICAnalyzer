import { Dispatch, SetStateAction } from "react";

type Mutate<T> = Dispatch<SetStateAction<T>>;

export function deepUpdate<T>(updater: Mutate<T>, path: string, value: any) {
	const parts = path.split(".");

	function recurs(current: any, index: number) {
		const key = parts[index];
		let localValue = value;
		if (index < parts.length - 1) {
			localValue = recurs(current[key], index + 1);
		}
		return { ...current, [key]: localValue };
	}

	return updater(current => recurs(current, 0));
}

export interface Merger<T> {

	(value: SetStateAction<T>): void;

	cache: Record<any, Merger<any>>;

	merge<K extends keyof T>(key: K, value: T[K]): void;

	sub<K extends keyof T>(key: K): Merger<T[K]>;
}

function derive<T>(merger: Merger<T>, key: keyof T) {

	function subSetValue(action: SetStateAction<any>) {
		if (typeof action !== "function") {
			return merger.merge(key, action);
		}
		merger((prev: any) => {
			const newVal = action(prev[key]);
			return { ...prev, [key]: newVal };
		});
	}

	return getMerger<T[typeof key]>(subSetValue);
}

export function getMerger<T>(mutate: Mutate<T>) {
	const merger = mutate as Merger<T>;

	if (merger.cache) {
		return merger;
	}

	merger.cache = {};

	merger.sub = (key: keyof T) => {
		return merger.cache[key] ??= derive(merger, key);
	};

	merger.merge = (key: keyof T, value: any) => {
		merger((prev: any) => ({ ...prev, [key]: value }));
	};

	return merger;
}
