import { noop } from "@kaciras/utilities/browser";
import React, { ChangeEvent, ChangeEventHandler, Dispatch, MouseEvent, useRef } from "react";
import clsx from "clsx";
import { TbArrowDown, TbArrowUp, TbMinus, TbPlus } from "react-icons/tb";
import styles from "./NumberInput.scss";

/**
 * When click and hold on a button - the delay before auto changing the value.
 */
const UPDATE_DELAY = 400;

/**
 * When click and hold on a button - the speed of auto changing the value.
 */
const UPDATE_SPEED = 50;

/**
 * Get the number of decimal places.
 */
function getPrecision(value: number) {
	const s = value.toString();
	const d = s.indexOf(".") + 1;
	return d || s.length - d;
}

export interface NumberInputProps {
	value?: number;
	min?: number;
	max?: number;
	step?: number;

	/**
	 * Set the stepping when using buttons to adjust the value,
	 * The difference with the step is that it is not used for validation.
	 *
	 * @default same as step
	 */
	increment?: number;

	/**
	 * Should add buttons to quickly set value to minimum / maximum.
	 */
	minMaxButton?: boolean;

	/**
	 * Set the id attribute for input element.
	 */
	inputId?: string;

	title?: string;
	name?: string;
	className?: string;
	disabled?: boolean;

	/**
	 * Equivalent to onChange(e => onValueChange(e.currentTarget.valueAsNumber))
	 */
	onValueChange?: Dispatch<number>;

	onChange?: ChangeEventHandler<HTMLInputElement>;
}

function NumberInput(props: NumberInputProps) {
	const {
		inputId,
		title,
		name,
		className,
		disabled,
		minMaxButton,
		value,
		min = 0,
		max = Number.MAX_SAFE_INTEGER,
		step = 1,
		increment = step,
		onChange = noop,
		onValueChange = noop,
	} = props;

	/**
	 * NumberInput hides browser default spinners and use custom buttons to adjust value,
	 * to support the onChange event, we dispatch input event from the native element.
	 */
	const inputRef = useRef<HTMLInputElement>(null);

	function updateValue(value: number) {
		const input = inputRef.current!;
		input.valueAsNumber = value;
		input.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
	}

	function handlePointerDown(event: MouseEvent, diff: number) {
		if (event.button !== 0) {
			return;
		}
		let timer = 0;
		const q = Math.pow(10, getPrecision(step));

		/** get the next value, resolve precision problem */
		function next(n: number) {
			n += diff;
			n = Math.min(Math.max(n, min), max);
			return Math.round(n * q) / q;
		}

		function increment(current: number) {
			const newValue = next(current);
			updateValue(newValue);
			timer = window.setTimeout(() => increment(newValue), UPDATE_SPEED);
		}

		function onPointerUp() {
			clearTimeout(timer);
			document.removeEventListener("mouseup", onPointerUp);
		}

		const newValue = next(inputRef.current!.valueAsNumber);
		updateValue(newValue);
		timer = window.setTimeout(() => increment(newValue), UPDATE_DELAY);
		document.addEventListener("mouseup", onPointerUp);
	}

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		onChange(event);
		onValueChange(event.currentTarget.valueAsNumber);
	}

	return (
		<div title={title} className={clsx(styles.container, className)}>
			{
				minMaxButton &&
				<button
					title="Min"
					type="button"
					className={styles.button}
					tabIndex={-1}
					disabled={disabled}
					onClick={() => updateValue(min)}
				>
					<TbArrowDown/>
				</button>
			}
			<button
				title="Decrease"
				type="button"
				className={styles.button}
				tabIndex={-1}
				disabled={disabled}
				onPointerDown={e => handlePointerDown(e, -increment)}
			>
				<TbMinus shapeRendering="crispEdges"/>
			</button>
			<input
				type="number"
				id={inputId}
				ref={inputRef}
				className={styles.input}
				disabled={disabled}
				name={name}
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={handleChange}
			/>
			<button
				title="Increase"
				type="button"
				className={styles.button}
				tabIndex={-1}
				disabled={disabled}
				onPointerDown={e => handlePointerDown(e, increment)}
			>
				<TbPlus shapeRendering="crispEdges"/>
			</button>
			{
				minMaxButton &&
				<button
					title="Max"
					type="button"
					className={styles.button}
					tabIndex={-1}
					disabled={disabled}
					onClick={() => updateValue(max)}
				>
					<TbArrowUp/>
				</button>
			}
		</div>
	);
}

export default React.memo(NumberInput);
