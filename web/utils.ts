/**
 * No effect function with a clear name.
 */
export const NOOP = () => {};

/**
 * Detect if browser support display AVIF image.
 *
 * @return true if supported, otherwise false.
 */
export function detectAVIFSupport() {
	const image = new Image();
	image.src = "data:image/avif;base64," +
		"AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUEAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAG" +
		"xpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABYAAAAoaWluZgAAAAAAAQAAABppbmZlAgAA" +
		"AAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgS" +
		"0AAAAAABNjb2xybmNseAABAAQAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB5tZGF0EgAKBzgADtAQQBkyCRAAAAAP+I9ngw==";
	return new Promise<boolean>(resolve => {
		image.onload = () => resolve(true);
		image.onerror = () => resolve(false);
	});
}

/**
 * Detect if browser support display WebP image.
 *
 * @return true if supported, otherwise false.
 */
export function detectWebPSupport() {
	const image = new Image();
	image.src = "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAQAAAAfQ//73v/+BiOh/AAA=";
	return new Promise<boolean>(resolve => {
		image.onload = () => resolve(true);
		image.onerror = () => resolve(false);
	});
}
