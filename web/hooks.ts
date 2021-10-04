import { Dispatch, SetStateAction, useEffect, useState } from "react";

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