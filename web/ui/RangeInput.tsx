import { ChangeEventHandler, CSSProperties } from "react";
import styles from "./RangeInput.scss";

interface RangeInputProps {
	value: number;
	min: number;
	max: number;
	step: number;

	name?: string;
	disabled?: boolean;

	onChange: ChangeEventHandler<HTMLInputElement>;
}

interface RangeInputCSS extends CSSProperties {
	"--value-percent": string;
}

export default function RangeInput(props: RangeInputProps) {
	const { value, min, max, step, disabled, onChange } = props;

	const percent = (value - min) / (max - min);

	const cssVariables: RangeInputCSS = {
		"--value-percent": `${percent * 100}%`,
	};

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
				onChange={onChange}
			/>

			<span className={styles.thumbRegion}>
				<span className={styles.thumb}/>
			</span>
		</span>
	);
}
