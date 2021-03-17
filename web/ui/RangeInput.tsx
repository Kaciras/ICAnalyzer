import { ChangeEvent, ChangeEventHandler, CSSProperties, Dispatch } from "react";
import { NOOP } from "../utils";
import styles from "./RangeInput.scss";
import clsx from "clsx";

interface RangeInputProps {
	value: number;
	min: number;
	max: number;
	step: number;

	className?: string;
	name?: string;
	disabled?: boolean;

	onValueChange?: Dispatch<number>;
	onChange?: ChangeEventHandler<HTMLInputElement>;
}

interface RangeInputCSS extends CSSProperties {
	"--value-percent": string;
}

export default function RangeInput(props: RangeInputProps) {
	const { className, value, min, max, step, disabled, onChange = NOOP, onValueChange = NOOP } = props;

	const percent = (value - min) / (max - min);
	const cssVariables: RangeInputCSS = {
		"--value-percent": `${percent * 100}%`,
	};

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		onChange(e);
		onValueChange(e.currentTarget.valueAsNumber);
	}

	return (
		<span
			className={clsx(styles.container, className)}
			style={cssVariables}
		>
			<input
				type="range"
				className={styles.input}
				disabled={disabled}
				value={value}
				min={min}
				max={max}
				step={step}
				onChange={handleChange}
			/>

			<span className={styles.thumbRegion}>
				<span className={styles.thumb}/>
			</span>
		</span>
	);
}
