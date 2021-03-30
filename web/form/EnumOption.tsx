import type { ControllerProps, OptionFieldProps, OptionType } from ".";
import { ChangeEvent } from "react";
import { CheckBox, ControlField, RadioBox } from "../ui";
import styles from "./EnumOption.scss";

interface EnumOptionConfig<T extends Record<string, any>> {
	id: string;
	label: string;
	enumObject: T;
	defaultValue: keyof T;
}

export default function enumOption<T>(data: EnumOptionConfig<T>): OptionType<keyof T, Array<keyof T>> {
	const { id, label, enumObject, defaultValue } = data;

	function initControlValue(range: Array<keyof T>) {
		return { value: range[0], labels: range };
	}

	function newOptionState() {
		return [defaultValue, [defaultValue]] as [keyof T, Array<keyof T>];
	}

	function Controller(props: ControllerProps<keyof T, Array<keyof T>>) {
		const { value, range, onChange } = props;

		function handleChange(e: ChangeEvent<HTMLInputElement>) {
			onChange(e.currentTarget.name as keyof T);
		}

		const items = range.map(name =>
			<RadioBox
				key={name}
				className={styles.item}
				checked={name === value}
				name={id}
				onChange={handleChange}
			>
				{name}
			</RadioBox>,
		);

		return (
			<ControlField {...props}>
				{label}
				<div className={styles.controls}>{items}</div>
			</ControlField>
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

			if (newVariables.length > 0) {
				onRangeChange(newVariables);
			}
		}

		function handleChangeC(e: ChangeEvent<HTMLInputElement>) {
			onValueChange(e.currentTarget.value as keyof T);
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
			items = Object.keys(enumObject).map(name => {
				return <RadioBox
					className={styles.item}
					key={name}
					name={id}
					value={name}
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
				<div className={styles.body}>{items}</div>
			</fieldset>
		);
	}

	function populate(value: keyof T, options: any) {
		options[id] = enumObject[value];
	}

	function generate(range: Array<keyof T>, prev: any) {
		return range.map(name => ({ ...prev, [id]: enumObject[name] }));
	}

	return { id, initControlValue, newOptionState, Controller, OptionField, populate, generate };
}
