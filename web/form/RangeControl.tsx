import { ChangeEvent, useState } from "react";
import { ControlField, RangeInput } from "../ui";
import { ControlType, FieldProps } from "./index";
import styles from "./RangeControl.scss";

export interface NumberRange {
	min: number;
	max: number;
	step: number;
}

export function sequence(range: NumberRange) {
	const { min, max, step } = range;
	return new Array<number>(Math.ceil((max + 1 - min) / step))
		.fill(min)
		.map((v, i) => v + i * step);
}

interface Metadata extends NumberRange {
	id: string;
	label: string;
}

export default class RangeControl implements ControlType<number> {

	private readonly data: Metadata;

	constructor(data: Metadata) {
		this.data = data;
		this.Input = this.Input.bind(this);
	}

	get id() {
		return this.data.id;
	}

	createState() {
		return sequence(this.data);
	}

	Input(props: FieldProps<number>) {
		const { id, label, min, max, step } = this.data;
		const { value, onChange } = props;

		// This is not a class component, just a render function in a class.
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const [tempValue, setTempValue] = useState(value);

		function handleRangeInput(newValue: number) {
			onChange(newValue);
			setTempValue(newValue);
		}

		function handleNumberInput(event: ChangeEvent<HTMLInputElement>) {
			const { target } = event;
			if (target.checkValidity()) {
				onChange(target.valueAsNumber);
			}
			setTempValue(target.valueAsNumber);
		}

		return (
			<ControlField {...props}>
				<div className={styles.header}>
					{label}
					<input
						className={styles.input}
						type="number"
						min={min}
						max={max}
						step={step}
						value={tempValue}
						required={true}
						onChange={handleNumberInput}
					/>
				</div>
				<RangeInput
					name={id}
					value={value}
					min={min}
					max={max}
					step={step}
					onClick={e => e.stopPropagation()}
					onValueChange={handleRangeInput}
				/>
			</ControlField>
		);
	}
}
