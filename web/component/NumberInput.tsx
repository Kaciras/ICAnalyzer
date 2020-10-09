import React, { useState } from "react";
import clsx from "clsx";
import Style from "./NumberInput.scss";

interface Props {
	value?: number;
	min?: number;
	max?: number;
	step?: number;
	precision?: number;

	disabled?: boolean;

	onChange?(value: number): void;
}

function useLimitedValue(
	init = 0,
	min: number = Number.NEGATIVE_INFINITY,
	max: number = Number.NEGATIVE_INFINITY,
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
	const [localValue, setLocalValue] = useLimitedValue(props.value, props.min, props.max, 0.5);

	const value = typeof props.value === "undefined" ? props.value : localValue;

	function setValue(newValue: number) {
		newValue = setLocalValue(newValue);
		if (props.onChange) {
			props.onChange(newValue);
		}
	}

	return (
		<div className={Style.container}>
			<input
				type="number"
				className={Style.input}
				disabled={props.disabled}
				value={value}
				onChange={(e) => setValue(e.target.valueAsNumber)}
			/>
			<button
				type="button"
				className={clsx(Style.button, Style.plus)}
				tabIndex={-1}
				disabled={props.disabled}
				onClick={() => setValue(value + (props.step || 1))}
			/>
			<button
				type="button"
				className={Style.button}
				tabIndex={-1}
				disabled={props.disabled}
				onClick={() => setValue(value - (props.step || 1))}
			/>
		</div>
	);
}
