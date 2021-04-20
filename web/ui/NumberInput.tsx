import { Dispatch, MouseEvent } from "react";
import clsx from "clsx";
import PlusIcon from "../assets/add.svg";
import MinusIcon from "../assets/remove.svg";
import ArrowUpIcon from "../assets/arrow_up.svg";
import ArrowDownIcon from "../assets/arrow_down.svg";
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

	/**
	 * Set the stepping interval to use when using up and down arrows to adjust the value,
	 * The difference with step is that this attribute is not used for validation.
	 *
	 * @default same as step
	 */
	increment?: number;

	minMaxButton?: boolean;

	inputId?: string;
	title?: string;
	name?: string;
	className?: string;
	disabled?: boolean;

	onValueChange?: Dispatch<number>;
}

export default function NumberInput(props: NumberInputProps) {
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
		onValueChange = NOOP,
	} = props;

	function handleMouseDown(event: MouseEvent, diff: number) {
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
		<div title={title} className={clsx(styles.container, className)}>
			{
				minMaxButton &&
				<button
					title="Min"
					type="button"
					className={styles.button}
					tabIndex={-1}
					disabled={disabled}
					onClick={() => onValueChange(min)}
				>
					<ArrowDownIcon/>
				</button>
			}
			<button
				title="Decrease"
				type="button"
				className={styles.button}
				tabIndex={-1}
				disabled={disabled}
				onMouseDown={e => handleMouseDown(e, -increment)}
			>
				<MinusIcon shapeRendering="crispEdges"/>
			</button>
			<input
				type="number"
				id={inputId}
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
				title="Increase"
				type="button"
				className={styles.button}
				tabIndex={-1}
				disabled={disabled}
				onMouseDown={e => handleMouseDown(e, increment)}
			>
				<PlusIcon shapeRendering="crispEdges"/>
			</button>
			{
				minMaxButton &&
				<button
					title="Max"
					type="button"
					className={styles.button}
					tabIndex={-1}
					disabled={disabled}
					onClick={() => onValueChange(max)}
				>
					<ArrowUpIcon/>
				</button>
			}
		</div>
	);
}
