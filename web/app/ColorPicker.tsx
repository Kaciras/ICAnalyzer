import { CSSProperties } from "react";
import styles from "./ColorPicker.scss";

function getPixel(image: ImageData, x: number, y: number) {
	const { width, data } = image;
	const i = (x + y * width) * 4;
	return Array.from(data.slice(i, i + 4));
}

function pad(n: string) {
	return n.length < 2 ? "0" + n : n;
}

function pixelToHex(pixel: number[]) {
	return "#" + pixel.map(n => pad(n.toString(16))).join("").toUpperCase();
}

interface ColorItemProps {
	name: string;
	value: number[];
}

function ColorItem(props: ColorItemProps) {
	const { name, value } = props;
	const color = pixelToHex(value);

	// Remove the alpha channel for color tile
	const cssVariables: any = {
		"--color": color.substring(0, 7),
	};

	return <div className={styles.color} style={cssVariables}>{name}: {color}</div>;
}

export interface PickColorPopupProps {
	style?: CSSProperties;

	x: number;
	y: number;
	imageA: ImageData;
	imageB: ImageData;
}

export default function ColorPicker(props: PickColorPopupProps) {
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
