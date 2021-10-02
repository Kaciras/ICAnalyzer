import { Dispatch, SetStateAction } from "react";

type Mutation<T> = Dispatch<SetStateAction<T>>;

export function deepUpdate<T>(updater: Mutation<T>, path: string, value: any) {
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

export interface ShallowMerger {

	(value: SetStateAction<any>): void;

	cache: Record<string, ShallowMerger>;

	sub(key: string): ShallowMerger;

	merge(key: string, value: any): void;
}

export function setupMerger(merger: any) {

	function deliver(key: string) {

		function subSetValue(action: SetStateAction<any>) {
			if (typeof action !== "function") {
				return merger.merge(key, action);
			}
			merger((prev: any) => {
				const newVal = action(prev[key]);
				return { ...prev, [key]: newVal };
			});
		}

		setupMerger(subSetValue);

		return subSetValue as ShallowMerger;
	}

	if (merger.cache) {
		return merger;
	}

	merger.cache = {};

	merger.sub = (key: string) => {
		return merger.cache[key] ??= deliver(key);
	};

	merger.merge = (key: string, value: any) => {
		merger((prev: any) => ({ ...prev, [key]: value }));
	};
}
