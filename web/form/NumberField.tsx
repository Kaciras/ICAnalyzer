import { Field, FieldProps } from "./base";
import style from "../app/App.scss";
import { RangeInput } from "../ui";
import { Dispatch } from "react";

interface NumberVariable {
	min: number;
	max: number;
	step: number;
}

interface NumberFieldProps extends FieldProps {
	value: number;
	variable: NumberVariable;
}

export default class NumberField implements Field<NumberFieldProps> {

	readonly min: number;
	readonly max: number;

	readonly defaultValue: number;

	constructor(min: number, max: number, defaultValue: number) {
		this.min = min;
		this.max = max;
		this.defaultValue = defaultValue;
	}

	createInitState() {

	}

	render(props: NumberFieldProps) {

	}
}

interface ControlProps {
	state: NumberVariable;
	index: number;
	onChange: Dispatch<number>;
}

function control(props: ControlProps) {
	const { state, index, onChange } = props;
	return (
		<label>
			<p>
				Quality (-q)
				<span className={style.optionValue}>{index}</span>
			</p>
			<RangeInput
				{...state}
				value={index}
				onChange={e => onChange(e.currentTarget.valueAsNumber)}
			/>
		</label>
	);
}
