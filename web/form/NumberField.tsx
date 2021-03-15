import { ChangeEvent } from "react";
import { CheckBox, RangeInput } from "../ui";
import { EncoderState } from "../codecs";
import { ControlProps, OptionType, StateProps } from "./base";
import styles from "./NumberField.scss";

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

interface NumberOptionState {
	// isVariable: boolean;
	constant: number;
	variable: NumberRange;
}

export default function numberOption(data: Metadata): OptionType<NumberOptionState> {
	const { property, label, min, max, step, defaultValue } = data;

	function newState() {
		return {
			constant: defaultValue,
			variable: { min, max, step },
		};
	}

	function ValueField(props: ControlProps<NumberOptionState>) {
		const { state, onChange, onFocus } = props;
		const { constant, variable } = state;
		const { min, max, step } = variable;

		return (
			<label onFocus={onFocus}>
				<p>
					{label}
					<span className={styles.optionValue}>{constant}</span>
				</p>
				<RangeInput
					value={constant}
					min={min}
					max={max}
					step={step}
					onValueChange={v => onChange({ ...state, constant: v })}
				/>
			</label>
		);
	}

	function ConstMode(props: StateProps<NumberOptionState>) {
		const { state, onChange } = props;

		function handleChange(e: ChangeEvent<HTMLInputElement>) {
			const { valueAsNumber } = e.currentTarget;
			onChange({ ...state, constant: valueAsNumber });
		}

		return (
			<RangeInput
				value={state.constant}
				min={min}
				max={max}
				step={step}
				onChange={handleChange}
			/>
		);
	}

	function VariableMode(props: StateProps<NumberOptionState>) {
		const { state, onChange } = props;
		const { variable } = state;

		function handleChange(e: ChangeEvent<HTMLInputElement>) {
			const { valueAsNumber, name } = e.currentTarget;
			const newVariable = { ...variable, [name]: valueAsNumber };
			onChange({ ...state, variable: newVariable });
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
						value={variable[name]}
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
				<Field name="min" max={variable.max}/>
				<Field name="max" min={variable.min}/>
				<Field name="step" min={variable.step}/>
			</div>
		);
	}

	function OptionField(props: StateProps<NumberOptionState>) {
		const { isVariable, state, onVariabilityChange } = props;
		const { constant } = state;

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
					{!isVariable && constant}
				</div>
				{isVariable ? VariableMode(props) : ConstMode(props)}
			</fieldset>
		);
	}

	function generate(state: EncoderState, isVariable: boolean, prev: any) {
		const { constant, variable } = state.data[property] as NumberOptionState;
		if (isVariable) {
			const { min, max, step } = variable;

			const rv = [];
			for (let i = min; i <= max; i += step) {
				rv.push({ ...prev, [property]: i });
			}
			return rv;
		} else {
			prev[property] = constant;
			return [prev];
		}
	}

	return { id: property, newState, ValueField, OptionField, generate };
}
