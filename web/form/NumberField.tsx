import { ChangeEvent, Dispatch, ReactNode, useState } from "react";
import { RangeInput } from "../ui";
import styles from "./NumberField.scss";

interface NumberFieldProps {
	value: number;
	min: number;
	max: number;
	step: number;

	className?: string;
	name?: string;
	disabled?: boolean;

	children?: ReactNode;
	onChange: Dispatch<number>;
}

export default function NumberField(props: NumberFieldProps) {
	const {
		name, className, disabled,
		value, min, max, step, onChange, children,
	} = props;

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
		<div className={className}>
			<div className={styles.header}>
				{children}
				<input
					className={styles.input}
					type="number"
					disabled={disabled}
					min={min}
					max={max}
					step={step}
					value={tempValue}
					required={true}
					onChange={handleNumberInput}
				/>
			</div>
			<RangeInput
				name={name}
				disabled={disabled}
				value={value}
				min={min}
				max={max}
				step={step}
				onClick={e => e.stopPropagation()}
				onValueChange={handleRangeInput}
			/>
		</div>
	);
}