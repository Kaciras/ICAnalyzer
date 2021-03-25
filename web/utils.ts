/**
 * No effect function with a clear name.
 */
export const NOOP = () => {};

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

/** A generic replacement for Function */
type Fn<T, A extends any[], R> = (this: T, ...args: A) => R;

export function debounce<T, A extends any[], R>(wait: number, func: Fn<T, A, R>) {
	let disallow = false;
	let result: R;

	return function debouncedFn(this: T, ...args: A) {
		if (disallow) {
			return result;
		}
		disallow = true;
		setTimeout(() => disallow = false, wait);
		return result = func.apply(this, args);
	};
}

export async function getFileFromUrl(url: string, signal?: AbortSignal) {
	const response = await fetch(url, { signal });
	const blob = await response.blob();

	// Firefox doesn't like content types like 'image/png; charset=UTF-8', which Webpack's dev
	// server returns. https://bugzilla.mozilla.org/show_bug.cgi?id=1497925.
	const type = /[^;]*/.exec(blob.type)![0];
	const name = new URL(url).pathname.split("/").pop() || "image";

	const timeHeader = response.headers.get("last-modified");
	const lastModified = timeHeader ? new Date(timeHeader).getTime() : undefined;

	return new File([blob], name, { type, lastModified });
}
