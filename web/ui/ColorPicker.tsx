import { CSSProperties } from "react";
import styles from "./ColorPicker.scss";

/**
 * Get the RGBA data at position in the image.
 *
 * @return the Uint8ClampedArray slice contains [R, G, B, A] values
 */
function getPixel(image: ImageData, x: number, y: number) {
	const { width, data } = image;
	const i = (x + y * width) * 4;
	return data.slice(i, i + 4);
}

function pad(n: string) {
	return n.length < 2 ? "0" + n : n;
}

/**
 * Convert the pixel data to hex color string.
 *
 * @example
 * pixelToHex([50, 186, 52, 0.5]); // "#32BA347F"
 */
function pixelToHex(pixel: Uint8ClampedArray) {
	return pixel
		.reduce((s, n) => s + pad(n.toString(16)), "#")
		.toUpperCase();
}

interface ColorItemProps {
	name: string;
	value: Uint8ClampedArray;
}

function ColorItem(props: ColorItemProps) {
	const { name, value } = props;
	const color = pixelToHex(value);

	// Remove the alpha channel for color tile
	const style: any = {
		"--color": color.substring(0, 7),
	};

	return <div className={styles.color} style={style}>{name}: {color}</div>;
}

export interface ColorPickerProps {
	x: number;
	y: number;
	imageA: ImageData;
	imageB: ImageData;
	style?: CSSProperties;
}

export default function ColorPicker(props: ColorPickerProps) {
	const { style, x, y, imageA, imageB } = props;

	const pixelA = getPixel(imageA, x, y);
	const pixelB = getPixel(imageB, x, y);
	const pixelDiff = pixelA.map((n, i) => Math.abs(n - pixelB[i]));

	return (
		<div className={styles.container} style={style}>
			<div>x: {x}, y: {y}</div>
			<ColorItem name="Origin" value={pixelA}/>
			<ColorItem name="Output" value={pixelB}/>
			<ColorItem name="Diff" value={pixelDiff}/>
		</div>
	);
}
