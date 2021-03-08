import { CheckBox, RadioBox } from "../ui";
import { State } from "../codecs";
import { ChangeEvent, Dispatch } from "react";
import style from "../app/ControlPanel.scss";
import { OptionType, StateProps } from "./base";

type EnumObject<T> = Record<string, T>;

interface Metadata<T> {
	property: string;
	label: string;
	enumObject: EnumObject<T>;
	defaultValue: string;
}

interface NumberRangeProps {
	state: State;
	onChange: Dispatch<string>;
	onFocus: () => void;
}

export default function enumOption<T>(data: Metadata<T>): OptionType {
	const { property, label, enumObject, defaultValue } = data;

	function ValueField(props: NumberRangeProps) {
		const { state, onChange, onFocus } = props;

		const a = (state.variables[property] ?? []) as string[];
		const value = (state.values[property] ?? defaultValue) as string;

		const items = Object.keys(a).map((name) => {
			return <RadioBox
				key={name}
				name={name}
				checked={value === name}
				onChange={() => onChange(name)}
			>
				{name}
			</RadioBox>;
		});

		return (
			<label onFocus={onFocus}>
				<p>
					{label}
					<span className={style.optionValue}>{value}</span>
				</p>
				<div>{items}</div>
			</label>
		);
	}

	function ConstMode(props: StateProps) {
		const { state, onChange } = props;

		const value = (state.values[property] ?? defaultValue) as string;

		function handleChange(newVal: string) {
			const copy = { ...state };
			copy.values[property] = newVal;
			onChange(copy);
		}

		const items = Object.keys(enumObject).map((name) => {
			return <RadioBox
				key={name}
				name={name}
				checked={value === name}
				onChange={() => handleChange(name)}
			>
				{name}
			</RadioBox>;
		});

		return <div>{items}</div>;
	}

	function OptionField(props: StateProps) {
		const { state, onChange } = props;

		const isVariable = state.varNames.includes(property);
		const a = (state.variables[property] ?? []) as string[];

		function handleChange(e: ChangeEvent<HTMLInputElement>) {
			if (e.currentTarget.checked) {
				state.varNames.push(property);
			} else {
				state.varNames = state.varNames.filter(v => v != property);
			}
			onChange({ ...state });
		}

		function handleChangeV(e: ChangeEvent<HTMLInputElement>) {
			const { valueAsNumber, name } = e.currentTarget;
			(a as any)[name] = valueAsNumber;

			const copy = { ...state };
			copy.variables[property] = a;
			onChange(copy);
		}

		const items = Object.entries(enumObject).map(e => {
			const [name, value] = e;
			return <CheckBox key={name} name={name} checked={a.includes(name)}>{name}</CheckBox>;
		});

		return (
			<fieldset>
				<div>
					<CheckBox checked={isVariable} onChange={handleChange}/>
					<span>{label}</span>
				</div>
				{isVariable ? <div>{items}</div> : ConstMode(props)}
			</fieldset>
		);
	}

	function generate(state: State, prev: any) {
		const { varNames, values, variables } = state;

		if (varNames.includes(property)) {
			const s = variables[property] as string[];

			const rv = [];
			for (const name of s) {
				rv.push({ ...prev, [property]: enumObject[name] });
			}
			return rv;
		} else {
			prev[property] = enumObject[values[property] as string];
			return [prev];
		}
	}

	return { id: property, ValueField, OptionField, generate };
}
