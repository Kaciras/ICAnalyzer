import { CSSProperties, FormEvent } from "react";
import Styles from "./RangeInput.scss";

interface Props {
	value?: number;
	min?: number;
	max?: number;
	step?: number;

	disabled?: boolean;

	onChange(e: FormEvent<HTMLInputElement>):void
}

interface RangeInputCSS extends CSSProperties {
	"--value-percent": string;
}

export default function RangeInput(props: Props) {
	const cssVariables: RangeInputCSS = {
		"--value-percent": `${props.value ?? 0}%`,
	};

	return (
		<span
			className={Styles.container}
			style={cssVariables}
		>
			<input
				type="range"
				className={Styles.input}
				value={props.value}
				min={props.min}
				max={props.max}
				step={props.step}
				onChange={props.onChange}
			/>

			<span className={Styles.thumbRegion}>
				<span className={Styles.thumb}/>
			</span>
		</span>
	);
}
