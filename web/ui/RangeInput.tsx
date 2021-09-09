import { ChangeEvent, ChangeEventHandler, CSSProperties, Dispatch, MouseEventHandler } from "react";
import clsx from "clsx";
import { NOOP } from "../utils";
import styles from "./RangeInput.scss";

interface RangeInputProps {
	value: number;
	min: number;
	max: number;
	step: number;

	className?: string;
	name?: string;
	disabled?: boolean;

	onClick?: MouseEventHandler<HTMLInputElement>;
	onValueChange?: Dispatch<number>;
	onChange?: ChangeEventHandler<HTMLInputElement>;
}

interface RangeInputCSS extends CSSProperties {
	"--value-percent": string;
}

export default function RangeInput(props: RangeInputProps) {
	const {
		className, name, value, min, max, step, disabled,
		onClick, onChange = NOOP, onValueChange = NOOP,
	} = props;

	const percent = (value - min) / (max - min);
	const cssVariables: RangeInputCSS = {
		"--value-percent": `${percent * 100}%`,
	};

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		onChange(e);
		onValueChange(e.currentTarget.valueAsNumber);
	}

	const clazz = clsx(
		styles.container,
		className,
		disabled && styles.disabled,
	);

	return (
		<div className={clazz} style={cssVariables}>
			<input
				type="range"
				className={styles.input}
				name={name}
				disabled={disabled}
				value={value}
				min={min}
				max={max}
				step={step}
				onClick={onClick}
				onChange={handleChange}
			/>
			<div className={styles.thumbRegion}>
				<div className={styles.thumb}/>
			</div>
		</div>
	);
}
