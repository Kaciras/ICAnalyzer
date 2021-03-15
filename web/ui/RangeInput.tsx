import { ChangeEvent, ChangeEventHandler, CSSProperties, Dispatch } from "react";
import styles from "./RangeInput.scss";
import { NOOP } from "../utils";

interface RangeInputProps {
	value: number;
	min: number;
	max: number;
	step: number;

	name?: string;
	disabled?: boolean;

	onValueChange?: Dispatch<number>;
	onChange?: ChangeEventHandler<HTMLInputElement>;
}

interface RangeInputCSS extends CSSProperties {
	"--value-percent": string;
}

export default function RangeInput(props: RangeInputProps) {
	const { value, min, max, step, disabled, onChange = NOOP, onValueChange = NOOP } = props;

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
			className={styles.container}
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
