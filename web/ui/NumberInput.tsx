import { Dispatch } from "react";
import clsx from "clsx";
import { NOOP } from "../utils";
import styles from "./NumberInput.scss";

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

	function startUpdate(diff: number) {
		let timer = 0;

		function update(localValue: number) {
			const newValue = localValue + diff;
			if (newValue > max || newValue < min) {
				return;
			}
			onValueChange(newValue);
			timer = setTimeout(() => update(newValue), 50);
		}

		function onMouseUp() {
			clearTimeout(timer);
			document.removeEventListener("mouseup", onMouseUp);
		}

		const newValue = value + diff;
		if (newValue > max || newValue < min) {
			return;
		}
		onValueChange(newValue);

		timer = setTimeout(() => update(newValue), 400);
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
				onMouseDown={() => startUpdate(step)}
			/>
			<button
				type="button"
				className={styles.button}
				tabIndex={-1}
				disabled={disabled}
				onMouseDown={() => startUpdate(-step)}
			/>
		</div>
	);
}
