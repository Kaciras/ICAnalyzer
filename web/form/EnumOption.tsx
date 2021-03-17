import type { ControlFieldProps, OptionFieldProps, OptionType } from ".";
import { ChangeEvent } from "react";
import { CheckBox, RadioBox } from "../ui";
import styles from "./EnumOption.scss";

interface Metadata<T extends Record<string, any>> {
	property: string;
	label: string;
	enumObject: T;
	defaultValue: keyof T;
}

export default function enumOption<T>(data: Metadata<T>): OptionType<keyof T, Array<keyof T>> {
	const { property, label, enumObject, defaultValue } = data;

	function initControlValue(range: Array<keyof T>) {
		return range[0];
	}

	function newOptionState() {
		return [defaultValue, []] as [keyof T, Array<keyof T>];
	}

	function ControlField(props: ControlFieldProps<keyof T, Array<keyof T>>) {
		const { value, range, onChange, onFocus } = props;

		function handleChange(e: ChangeEvent<HTMLInputElement>) {
			onChange(e.currentTarget.name as keyof T);
		}

		const items = (range as string[]).map(name =>
			<RadioBox
				key={name}
				checked={name === value}
				name={name}
				onChange={handleChange}
			>
				{name}
			</RadioBox>,
		);

		return (
			<label onClick={onFocus}>
				<p>
					{label}
				</p>
				<div>{items}</div>
			</label>
		);
	}

	function OptionField(props: OptionFieldProps<keyof T, Array<keyof T>>) {
		const { isVariable, value, range, onValueChange, onRangeChange, onVariabilityChange } = props;

		function handleChangeV(e: ChangeEvent<HTMLInputElement>) {
			const { checked, name } = e.currentTarget;
			let newVariables = [...range];

			if (checked) {
				newVariables.push(name as any);
			} else {
				newVariables = range.filter(v => v !== name);
			}
			onRangeChange(newVariables);
		}

		function handleChangeC(e: ChangeEvent<HTMLInputElement>) {
			onValueChange(e.currentTarget.name as keyof T);
		}

		let items: any[];
		if (isVariable) {
			items = Object.keys(enumObject).map(name => {
				return <CheckBox
					className={styles.item}
					key={name}
					name={name}
					checked={range.includes(name as any)}
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
					checked={value === name}
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

	function populate(value: keyof T, options: any) {
		options[property] = enumObject[value];
	}

	function generate(range: Array<keyof T>, prev: any) {
		return range.map(name => ({ ...prev, [property]: enumObject[name] }));
	}

	return { id: property, initControlValue, newOptionState, ControlField, OptionField, populate, generate };
}
