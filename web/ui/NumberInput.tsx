import { Dispatch } from "react";
import clsx from "clsx";
import { NOOP } from "../utils";
import styles from "./NumberInput.scss";

const UPDATE_SPEED = 50;
const UPDATE_DELAY = 400;

function getPrecision(value: number) {
	const s = value.toString();
	const d = s.indexOf(".") + 1;
	return d || s.length - d;
}

export interface NumberInputProps {
	value: number;
	min?: number;
	max?: number;
	step?: number;

	name?: string;
	className?: string;
	disabled?: boolean;

	onValueChange?: Dispatch<number>;
}

export default function NumberInput(props: NumberInputProps) {
	const {
		name,
		className,
		disabled,
		value,
		min = 0,
		max = Number.MAX_SAFE_INTEGER,
		step = 1,
		onValueChange = NOOP,
	} = props;

	function handleMouseDown(diff: number) {
		let timer = 0;
		const q = Math.pow(10, getPrecision(step));

		/** get the next value, resolve precision problem */
		function next(n: number) {
			n += diff;
			n = Math.min(Math.max(n, min), max);
			return Math.round(n * q) / q;
		}

		function update(current: number) {
			const newValue = next(current);
			onValueChange(newValue);
			timer = window.setTimeout(() => update(newValue), UPDATE_SPEED);
		}

		function onMouseUp() {
			clearTimeout(timer);
			document.removeEventListener("mouseup", onMouseUp);
		}

		const newValue = next(value);
		onValueChange(newValue);
		timer = window.setTimeout(() => update(newValue), UPDATE_DELAY);
		document.addEventListener("mouseup", onMouseUp);
	}

	return (
		<div className={clsx(styles.container, className)}>
			<input
				type="number"
				className={styles.input}
				disabled={disabled}
				name={name}
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={e => onValueChange(e.currentTarget.valueAsNumber)}
			/>
			<button
				type="button"
				className={clsx(styles.button, styles.plus)}
				tabIndex={-1}
				disabled={disabled}
				onMouseDown={() => handleMouseDown(step)}
			/>
			<button
				type="button"
				className={styles.button}
				tabIndex={-1}
				disabled={disabled}
				onMouseDown={() => handleMouseDown(-step)}
			/>
		</div>
	);
}
