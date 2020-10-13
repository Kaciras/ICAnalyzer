import React, { CSSProperties, FormEvent, useState } from "react";
import clsx from "clsx";
import Styles from "./RangeInput.scss";

interface Props {
	value?: number;
	min?: number;
	max?: number;
	step?: number;

	disabled?: boolean;

	onChange(e: FormEvent<HTMLInputElement>):void
}

interface RangeInputCSS extends CSSProperties {
	"--value-percent": string;
}

export default function RangeInput(props: Props) {
	const [dragging, setDragging] = useState(false);

	function mouseMove() {
		setDragging(true);

		function moveEnd(event: Event) {
			event.preventDefault();
			setDragging(false);
			document.removeEventListener("mouseup", moveEnd);
		}

		document.addEventListener("mouseup", moveEnd);
	}

	function touchMove() {
		setDragging(true);

		function moveEnd(event: Event) {
			event.preventDefault();
			setDragging(false);
			document.removeEventListener("touchend", moveEnd);
		}

		document.addEventListener("touchend", moveEnd);
	}

	const classes = clsx(
		Styles.thumb,
		{ [Styles.active]: dragging },
	);

	const cssVariables: RangeInputCSS = {
		"--value-percent": `${props.value ?? 0}%`,
	};

	return (
		<span
			className={Styles.container}
			style={cssVariables}
			onMouseDown={mouseMove}
			onTouchStart={touchMove}
		>
			<input
				type="range"
				className={Styles.input}
				value={props.value}
				min={props.min}
				max={props.max}
				step={props.step}
				onChange={props.onChange}
			/>

			<span className={Styles.thumbRegion}>
				<span className={classes}/>
			</span>
		</span>
	);
}
