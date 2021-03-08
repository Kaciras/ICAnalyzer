import { ChangeEvent, Dispatch } from "react";
import { CheckBox } from "../ui";
import { State } from "../codecs";
import { OptionType, StateProps } from "./base";

interface Metadata {
	property: string;
	label: string;
	defaultValue: boolean;
}

interface NumberRangeProps {
	state: State;
	onChange: Dispatch<boolean>;
	onFocus: () => void;
}

export default function boolOption(data: Metadata): OptionType {
	const { property, label, defaultValue } = data;

	function ValueField(props: NumberRangeProps) {
		const { state, onChange, onFocus } = props;

		const value = (state.values[property] ?? defaultValue) as boolean;

		function handleChange(e: ChangeEvent<HTMLInputElement>) {
			onChange(e.currentTarget.checked);
		}

		return (
			<label onFocus={onFocus}>
				<CheckBox checked={value} onChange={handleChange}>{label}</CheckBox>;
			</label>
		);
	}

	function ConstMode(props: StateProps) {
		const { state, onChange } = props;

		const value = (state.values[property] ?? defaultValue) as boolean;

		function handleChange(e: ChangeEvent<HTMLInputElement>) {
			const copy = { ...state };
			copy.values[property] = e.currentTarget.checked;
			onChange(copy);
		}

		return <CheckBox checked={value} onChange={handleChange}>{label}</CheckBox>;
	}

	function OptionField(props: StateProps) {
		const { state, onChange } = props;

		const isVariable = state.varNames.includes(property);

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
					<CheckBox checked={isVariable} onChange={handleChange}/>
					<span>{label}</span>
				</div>
				{isVariable ? <strong>OFF & ON</strong> : ConstMode(props)}
			</fieldset>
		);
	}

	function generate(state: State, prev: any) {
		const { varNames, values } = state;

		if (varNames.includes(property)) {
			return [
				{ ...prev, [property]: false },
				{ ...prev, [property]: true },
			];
		} else {
			prev[property] = values[property] as boolean;
			return [prev];
		}
	}

	return { id: property, ValueField, OptionField, generate };
}
