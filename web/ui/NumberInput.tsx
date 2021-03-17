import { ChangeEvent, ChangeEventHandler, Dispatch, useState } from "react";
import clsx from "clsx";
import styles from "./NumberInput.scss";

interface Props {
	value?: number;
	min?: number;
	max?: number;
	step?: number;
	precision?: number;

	name?: string;
	className?: string;
	disabled?: boolean;

	onChange?: ChangeEventHandler<HTMLInputElement>;
	onValueChange?: Dispatch<number>;
}

function useLimitedValue(
	init = 0,
	min: number = Number.NEGATIVE_INFINITY,
	max: number = Number.POSITIVE_INFINITY,
	precision = 0,
): [number, (v: number) => number] {

	const [value, setValue] = useState(init);

	function setValueLimited(newValue: number) {
		if (newValue > max) {
			newValue = max;
		} else if (newValue < min) {
			newValue = min;
		} else if (precision !== 0) {
			const s = newValue / precision;
			if (!Number.isInteger(s)) {
				newValue = Math.round(s) * precision;
			}
		}
		setValue(newValue);
		return newValue;
	}

	return [value, setValueLimited];
}

export default function NumberInput(props: Props) {
	const { name, className, value, min, max, step, disabled, onChange, onValueChange } = props;
	const [localValue, setLocalValue] = useLimitedValue(value, min, max, 0.5);

	const valueT = typeof value === "undefined" ? localValue : value;

	function setValue(event: ChangeEvent<HTMLInputElement>) {
		const value = event.target.valueAsNumber;
		if (onChange) {
			onChange(event);
		}
		if (onValueChange) {
			onValueChange(value);
		}
		setLocalValue(value);
	}

	return (
		<div className={clsx(styles.container, className)}>
			<input
				type="number"
				className={styles.input}
				disabled={disabled}
				name={name}
				value={value}
				onChange={setValue}
			/>
			<button
				type="button"
				className={clsx(styles.button, styles.plus)}
				tabIndex={-1}
				disabled={disabled}
				onClick={() => setValue(valueT + (step || 1))}
			/>
			<button
				type="button"
				className={styles.button}
				tabIndex={-1}
				disabled={disabled}
				onClick={() => setValue(valueT - (step || 1))}
			/>
		</div>
	);
}
