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

	function reset(value: number) {
		setValue(0);
		setMax(value);
		setError(undefined);
	}

	function increase() {
		setValue(v => v + 1);
	}

	return { value, max, error, increase, reset, setError };
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