import { ChangeEvent, Dispatch } from "react";
import { CheckBox, NumberInput, RangeInput } from "../ui";
import { State } from "../codecs";
import { OptionType, StateProps } from "./base";
import styles from "./NumberField.module.scss";

interface NumberRangeAttrs {
	min: number;
	max: number;
	step: number;
}

interface Metadata extends NumberRangeAttrs {
	property: string;
	label: string;
	defaultValue: number;
}

interface NumberRangeProps {
	state: State;
	onChange: Dispatch<number>;
	onFocus: () => void;
}

export default function numberRange(data: Metadata): OptionType {
	const { property, label, min, max, step, defaultValue } = data;

	function ValueField(props: NumberRangeProps) {
		const { state, onChange, onFocus } = props;

		const a = (state.variables[property] ?? data) as NumberRangeAttrs;
		const { min, max, step } = a;

		const value = (state.values[property] ?? defaultValue) as number;

		function handleChange(e: ChangeEvent<HTMLInputElement>) {
			onChange(e.currentTarget.valueAsNumber);
		}

		return (
			<label onFocus={onFocus}>
				<p>
					{label}
					<span className={styles.optionValue}>{value}</span>
				</p>
				<RangeInput
					value={value}
					min={min}
					max={max}
					step={step}
					onChange={handleChange}
				/>
			</label>
		);
	}

	function ConstMode(props: StateProps) {
		const { state, onChange } = props;

		const value = (state.values[property] ?? defaultValue) as number;

		function handleChange(e: ChangeEvent<HTMLInputElement>) {
			const newVal = e.currentTarget.valueAsNumber;
			const copy = { ...state };
			copy.values[property] = newVal;
			onChange(copy);
		}

		return (
			<label>
				<RangeInput
					value={value}
					min={min}
					max={max}
					step={step}
					onChange={handleChange}
				/>
				<span>{value}</span>
			</label>
		);
	}

	function VariableMode(props: StateProps) {
		const { state, onChange } = props;

		const a = (state.variables[property] ?? data) as NumberRangeAttrs;
		const {
			min: localMin,
			max: localMax,
			step: localStep,
		} = a;

		function handleChange(e: ChangeEvent<HTMLInputElement>) {
			const { valueAsNumber, name } = e.currentTarget;
			(a as any)[name] = valueAsNumber;

			const copy = { ...state };
			copy.variables[property] = a;
			onChange(copy);
		}

		return (
			<div>
				<label className={styles.spinner}>
					<span>from:</span>
					<NumberInput
						name="min"
						value={localMin}
						min={min}
						max={max}
						step={step}
						onChange={handleChange}
					/>
				</label>
				<label className={styles.spinner}>
					<span>to:</span>
					<NumberInput
						name="max"
						value={localMax}
						min={min}
						max={max}
						step={step}
						onChange={handleChange}
					/>
				</label>
				<label className={styles.spinner}>
					<span>step:</span>
					<NumberInput
						name="step"
						value={localStep}
						min={min}
						max={max}
						step={step}
						onChange={handleChange}
					/>
				</label>
			</div>
		);
	}

	function OptionField(props: StateProps) {
		const { state, onChange } = props;

		const checked = state.varNames.includes(property);

		function handleChange(e: ChangeEvent<HTMLInputElement>) {
			if (e.currentTarget.checked) {
				state.varNames.push(property);
			} else {
				state.varNames = state.varNames.filter(v => v != property);
			}
			onChange({ ...state });
		}

		return (
			<fieldset>
				<div>
					<CheckBox checked={checked} onChange={handleChange}/>
					<span>{label}</span>
				</div>
				{checked ? VariableMode(props) : ConstMode(props)}
			</fieldset>
		);
	}

	function generate(state: State, prev: any) {
		const { varNames, values, variables } = state;
		if (varNames.includes(property)) {
			const { min, max, step } = variables[property] as NumberRangeAttrs;

			const rv = [];
			for (let i = min; i <= max; i += step) {
				rv.push({ ...prev, [property]: i });
			}
			return rv;
		} else {
			prev[property] = values[property];
			return [prev];
		}
	}

	return { id: property, ValueField, OptionField, generate };
}
