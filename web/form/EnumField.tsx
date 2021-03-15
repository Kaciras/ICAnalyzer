import { CheckBox, RadioBox } from "../ui";
import { EncoderState } from "../codecs";
import { ChangeEvent } from "react";
import { ControlProps, OptionType, StateProps } from "./base";
import styles from "./EnumFIeld.scss";

interface EnumOptionState<T> {
	// isVariable: boolean;
	constant: keyof T;
	variable: Array<keyof T>;
}

interface Metadata<T extends Record<string, any>> {
	property: string;
	label: string;
	enumObject: T;
	defaultValue: keyof T;
}

export default function enumOption<T>(data: Metadata<T>): OptionType<EnumOptionState<T>> {
	const { property, label, enumObject, defaultValue } = data;

	function newState() {
		return { constant: defaultValue, variable: [] };
	}

	function ValueField(props: ControlProps<EnumOptionState<T>>) {
		const { state, onChange, onFocus } = props;
		const { constant, variable } = state;

		function handleChange(e: ChangeEvent<HTMLInputElement>) {
			// @ts-ignore
			onChange({ ...state, constant: e.currentTarget.name });
		}

		const items = Object.keys(variable).map((name) =>
			<RadioBox
				key={name}
				name={name}
				checked={name === constant}
				onChange={handleChange}
			>
				{name}
			</RadioBox>,
		);

		return (
			<label onFocus={onFocus}>
				<p>
					{label}
				</p>
				<div>{items}</div>
			</label>
		);
	}

	function OptionField(props: StateProps<EnumOptionState<T>>) {
		const { isVariable, state, onChange, onVariabilityChange } = props;
		const { constant, variable } = state;

		function handleChangeV(e: ChangeEvent<HTMLInputElement>) {
			const { checked, name } = e.currentTarget;
			let newVariables = [...variable];

			if (checked) {
				newVariables.push(name as any);
			} else {
				newVariables = variable.filter(v => v !== name);
			}
			onChange({ ...state, variable: newVariables });
		}

		function handleChangeC(e: ChangeEvent<HTMLInputElement>) {
			// @ts-ignore
			onChange({ ...state, constant: e.currentTarget.name });
		}

		let items: any[];
		if (isVariable) {
			items = Object.keys(enumObject).map(name => {
				return <CheckBox
					className={styles.item}
					key={name}
					name={name}
					checked={variable.includes(name as any)}
					onChange={handleChangeV}
				>
					{name}
				</CheckBox>;
			});
		} else {


			items = Object.keys(enumObject).map((name) => {
				return <RadioBox
					className={styles.item}
					key={name}
					name={name}
					checked={constant === name}
					onChange={handleChangeC}
				>
					{name}
				</RadioBox>;
			});
		}

		return (
			<fieldset className={styles.fieldset}>
				<CheckBox
					className={styles.header}
					checked={isVariable}
					onValueChange={onVariabilityChange}
				>
					{label}
				</CheckBox>
				{items}
			</fieldset>
		);
	}

	function generate(state: EncoderState, isVariable: boolean, prev: any) {
		const { constant, variable } = state.data[property] as EnumOptionState<T>;

		if (isVariable) {
			const rv = [];
			for (const name of variable) {
				rv.push({ ...prev, [property]: enumObject[name] });
			}
			return rv;
		} else {
			prev[property] = enumObject[constant];
			return [prev];
		}
	}

	return { id: property, newState, ValueField, OptionField, generate };
}
