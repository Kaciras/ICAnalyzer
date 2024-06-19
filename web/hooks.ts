import { Dispatch, SetStateAction, useEffect, useState } from "react";

export interface ProgressState {
	value: number;
	max: number;
	error?: string;

	increase: () => void;
	reset: (max: number) => void;
	setError: Dispatch<string>;
}

export function useProgress(initialMax = 1): ProgressState {
	const [max, setMax] = useState(initialMax);
	const [value, setValue] = useState(0);
	const [error, setError] = useState<string>();

	function reset(max: number) {
		setValue(0);
		setMax(max);
		setError(undefined);
	}

	function increase() {
		setValue(v => v + 1);
	}

	return { value, max, error, increase, reset, setError };
}

/** Alia of the setter type in React state hook */
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

/**
 * Enhanced mutator, designed to help mutate nested properties of an object.
 *
 * @example
 * const [value, setValue] = useState({ a: { b: { c: 0 } } });
 *
 * // The code that uses mutator:
 *
 * const setA = (newValue) => setValue(prev => ({
 *     ...prev, a: newValue
 * });
 * const setC = (newValue) => setValue(prev => ({
 *     ...prev, a: {
 *         ...prev.a, b: {
 *             ...prev.b, c: newValue
 *         }
 *     }
 * });
 * const memoizedSetA = useCallback(setA, [setValue]);
 * const memoizedSetC = useCallback(setC, [setValue]);
 *
 * // Use merger instead:
 *
 * const memoizedSetA = getMerger(setValue).sub("a");
 * const memoizedSetC = memoizedSetA.sub("b").sub("c");
 */
export interface Merger<T> {

	(value: SetStateAction<T>): void;

	/**
	 * Internal usage, keep sub merger references.
	 */
	cache: Map<any, Merger<any>>;

	/**
	 * Convenient function to copies properties to current value.
	 */
	merge(changes: Partial<T>): void;

	/**
	 * Convenient function to change a property of current value.
	 *
	 * @param key the property name
	 * @param value the new value
	 */
	set<K extends keyof T>(key: K, value: T[K]): void;

	/**
	 * Get the child merger for specified property, when the merger mutate its value,
	 * the new value will be merged into the parent object recursively.
	 *
	 * The child merger is cached, call this function on re-renders always returns the same reference.
	 *
	 * @param key the property name
	 * @return the merger for specified property
	 */
	sub<K extends keyof T>(key: K): Merger<T[K]>;
}

function derive<T>(merger: Merger<T>, key: keyof T) {

	function subSetValue(action: SetStateAction<any>) {
		if (typeof action !== "function") {
			return merger.set(key, action);
		}
		merger(prev => {
			const newVal = action(prev[key]);
			return { ...prev, [key]: newVal };
		});
	}

	return getMerger<T[typeof key]>(subSetValue);
}

/**
 * Convert a mutator to a merger, the mutator identity must be stable and won't change on re-renders.
 */
export function getMerger<T>(mutator: Mutator<T>) {
	const merger = mutator as Merger<T>;

	if (merger.cache) {
		return merger;
	}
	merger.cache = new Map();

	merger.merge = changes => {
		merger(prev => ({ ...prev, ...changes }));
	};

	merger.set = (key, value) => {
		merger(prev => ({ ...prev, [key]: value }));
	};

	merger.sub = key => {
		let cachedSetter = merger.cache.get(key);
		if (!cachedSetter) {
			cachedSetter = derive(merger, key);
			merger.cache.set(key, cachedSetter);
		}
		return cachedSetter;
	};

	return merger;
}

type LocalStorageState<T> = [T, Mutator<T>, () => void];

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
