import type { ControlFieldProps, OptionFieldProps, OptionType } from ".";
import { ChangeEvent } from "react";
import { CheckBox, RangeInput } from "../ui";
import styles from "./NumberOption.scss";

interface NumberRange {
	min: number;
	max: number;
	step: number;
}

interface Metadata extends NumberRange {
	property: string;
	label: string;
	defaultValue: number;
}

export default function numberOption(data: Metadata): OptionType<number, NumberRange> {
	const { property, label, min, max, step, defaultValue } = data;

	function initControlValue(range: NumberRange) {
		return range.min;
	}

	function newOptionState() {
		return [defaultValue, { min, max, step }] as [number, NumberRange];
	}

	function ControlField(props: ControlFieldProps<number, NumberRange>) {
		const { value, range, onChange, onFocus } = props;
		const { min, max, step } = range;

		return (
			<label onClick={onFocus}>
				<p>
					{label}
					<span className={styles.optionValue}>{value}</span>
				</p>
				<RangeInput
					value={value}
					min={min}
					max={max}
					step={step}
					onValueChange={onChange}
				/>
			</label>
		);
	}

	function ConstMode(props: OptionFieldProps<number, NumberRange>) {
		const { value, onValueChange } = props;

		return (
			<RangeInput
				value={value}
				min={min}
				max={max}
				step={step}
				onValueChange={onValueChange}
			/>
		);
	}

	function VariableMode(props: OptionFieldProps<number, NumberRange>) {
		const { range, onRangeChange } = props;

		function handleChange(e: ChangeEvent<HTMLInputElement>) {
			const { valueAsNumber, name } = e.currentTarget;
			onRangeChange({ ...range, [name]: valueAsNumber });
		}

		interface FieldProps {
			name: keyof NumberRange;
			min?: number;
			max?: number;
			step?: number;
		}

		const Field = (props: FieldProps) => {
			const { name, min, max, step } = { ...data, ...props };

			return (
				<label className={styles.spinner}>
					<span>{name}</span>
					<input
						className={styles.numberInput}
						type="number"
						name={name}
						value={range[name]}
						min={min}
						max={max}
						step={step}
						onChange={handleChange}
					/>
				</label>
			);
		};

		return (
			<div>
				<Field name="min" max={range.max}/>
				<Field name="max" min={range.min}/>
				<Field name="step" min={step}/>
			</div>
		);
	}

	function OptionField(props: OptionFieldProps<number, NumberRange>) {
		const { isVariable, value, onVariabilityChange } = props;

		return (
			<fieldset className={styles.fieldset}>
				<div className={styles.header}>
					<CheckBox
						className={styles.label}
						checked={isVariable}
						onValueChange={onVariabilityChange}
					>
						{label}
					</CheckBox>
					{!isVariable && value}
				</div>
				{isVariable ? <VariableMode {...props}/> : <ConstMode {...props}/>}
			</fieldset>
		);
	}

	function populate(value: number, options: any) {
		options[property] = value;
	}

	function generate(state: NumberRange, options: any) {
		const { min, max, step } = state;

		const list = [];
		for (let i = min; i <= max; i += step) {
			list.push({ ...options, [property]: i });
		}
		return list;
	}

	return { id: property, initControlValue, newOptionState, ControlField, OptionField, populate, generate };
}
