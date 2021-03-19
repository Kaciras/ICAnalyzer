import type { ControlFieldProps, OptionFieldProps, OptionType } from ".";
import { ChangeEvent } from "react";
import { CheckBox, RadioBox } from "../ui";
import styles from "./EnumOption.scss";

interface MappingConfig<T extends Record<string, any>> {
	id: string;
	label: string;
	enumObject: T;
	defaultValue: keyof T;
}

interface ArrayConfig {
	id: string;
	label: string;
	enumObject: string[];
	defaultValue: string;
}

function selfMap(values: string[]) {
	return Object.fromEntries(values.map(v => [v, v]));
}

export type EnumOptionConfig<T> = ArrayConfig | MappingConfig<T>;

export default function enumOption<T>(data: EnumOptionConfig<T>): OptionType<keyof T, Array<keyof T>> {
	const { id, label, enumObject, defaultValue } = data;

	const valueMap = Array.isArray(enumObject) ? selfMap(enumObject) : enumObject;

	function initControlValue(range: Array<keyof T>) {
		return { value: range[0], labels: range };
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
				className={styles.item}
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
				<div className={styles.body}>{items}</div>
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
			items = Object.keys(valueMap).map(name => {
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
			items = Object.keys(valueMap).map(name => {
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
				<div className={styles.body}>{items}</div>
			</fieldset>
		);
	}

	function populate(value: keyof T, options: any) {
		options[id] = valueMap[value];
	}

	function generate(range: Array<keyof T>, prev: any) {
		return range.map(name => ({ ...prev, [id]: valueMap[name] }));
	}

	return { id, initControlValue, newOptionState, ControlField, OptionField, populate, generate };
}
