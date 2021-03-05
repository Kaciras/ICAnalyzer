import { ChangeEvent, Dispatch } from "react";
import { CheckBox, NumberInput, RangeInput } from "../ui";
import { State } from "../codecs";

interface StateProps {
	state: State;
	onChange: Dispatch<any>;
}

export interface OptionType {

	ValueField(props: StateProps): JSX.Element;

	OptionField(props: StateProps): JSX.Element;

	generate(state: any, prev: any): Iterable<any>;
}

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

export default function numberRange(data: Metadata): OptionType<any, any> {
	const { property, label, min, max, step, defaultValue } = data;

	function ValueField(props: StateProps) {
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
				<p>{property}</p>
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

	function VariableField(props: StateProps) {
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
				<p>{property}</p>
				<label>
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
				<label>
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
				<label>
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
			<div>
				<div>
					<p>{property}</p>
					<CheckBox checked={checked} onChange={handleChange}/>
				</div>
				{checked ? VariableField(props) : ValueField(props)}
			</div>
		);
	}

	function* generate(state: State, prev: any) {
		const { min, max, step } = state.variables[property] as NumberRangeAttrs;
		for (let i = min; i < max; i += step) {
			yield { ...prev, [property]: i };
		}
	}

	return { ValueField, OptionField, generate };
}
