import { Dispatch, SetStateAction } from "react";

export type Mutator<T> = Dispatch<SetStateAction<T>>;

export function deepUpdate<T>(updater: Mutator<T>, path: string, value: any) {
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

	merge(changes: Partial<T>): void;

	set<K extends keyof T>(key: K, value: T[K]): void;

	sub<K extends keyof T>(key: K): Merger<T[K]>;
}

function derive<T>(merger: Merger<T>, key: keyof T) {

	function subSetValue(action: SetStateAction<any>) {
		if (typeof action !== "function") {
			return merger.set(key, action);
		}
		merger((prev: any) => {
			const newVal = action(prev[key]);
			return { ...prev, [key]: newVal };
		});
	}

	return getMerger<T[typeof key]>(subSetValue);
}

export function getMerger<T>(mutate: Mutator<T>) {
	const merger = mutate as Merger<T>;

	if (merger.cache) {
		return merger;
	}

	merger.cache = {};

	merger.merge = changes => {
		merger(prev => ({ ...prev, ...changes }));
	};

	merger.set = (key, value) => {
		merger(prev => ({ ...prev, [key]: value }));
	};

	merger.sub = (key) => {
		return merger.cache[key] ??= derive(merger, key);
	};

	return merger;
}
